---
title: PixiJS rendering failure
tags:
  - pixijs
  - webgl
  - webgpu
  - typescript
  - gpu
  - "#bug"
  - "#bug-open"
url: pixijs-rendering-failure
---
>[!info]- Software versions used
>- This issue was encountered and debugged on a Google Pixel 9 Pro XL running [Android 15](https://developer.android.com/about/versions/15)
>- [PixiJS v8.9.2](https://github.com/pixijs/pixijs/releases/tag/v8.9.2)
>- [npm 11.3.0](https://www.npmjs.com/package/npm/v/11.3.0)
>- [Typescript 5.8.3](https://www.npmjs.com/package/typescript/v/5.8.3)

> [!bug]+ Referenced Issues:
> - GitHub Issue [#11389](https://github.com/pixijs/pixijs/issues/11389).
> - This is still a bug as of [PixiJS v8.9.2](https://github.com/pixijs/pixijs/releases/tag/v8.9.2). Since writing, this bug has been resolved and the issue closed - however it is still pending a new release.
## Summary
The [PixiJS v8 release](https://github.com/pixijs/pixijs/releases/tag/v8.0.0) introduced WebGPU support to leverage modern GPU capabilities when rendering rather than just WebGL. Unfortunately, this has come with a rendering issue where certain devices seemingly fail to render anything when WebGPU is used.

For example, the example PixiJS script at https://pixijs.com/8.x/playground outputs the following:

![[pixijs-playground.gif|350]]

This works on all devices since it defaults to using WebGL. However, if we were to modify the call to `app.init` to prefer WebGPU like so:
```ts
await app.init({ background: '#1099bb', resizeTo: window, preference: "webgpu" });
```
the script would only render on *some* devices. A known example of this are Google Pixel 9 phones.
## Root cause
The cause of this actually boils down to how PixiJS batches display objects for rendering. To optimise performance, PixiJS groups compatible display objects, such as sprites sharing similar textures and shaders, into batches. These batches are then rendered in a single GPU draw call, significantly reducing overhead.

A critical constraint in the batching process is the maximum number of textures that can used in a single draw call. Versions of PixiJS with the rendering issue falsely assume that the WebGPU limit for maximum textures is the same as the WebGL limit on a given device.

Unfortunately, there are some WebGPU supported devices where the WebGL limit is greater than the WebGPU limit. This causes rendering to fail and the console logs to show something similar to the following:

```log
The number of sampled textures (32) in the Fragment stage exceeds the maximum per-stage limit (16).
 - While validating binding counts
 - While validating [BindGroupLayoutDescriptor]
 - While calling [Device].CreateBindGroupLayout([BindGroupLayoutDescriptor]).

Invalid BindGroupLayout (unlabeled)] is invalid.
 - While calling [Device].CreatePipelineLayout([PipelineLayoutDescriptor]).

[Invalid PipelineLayout (unlabeled)] is invalid.
 - While calling [Device].CreateRenderPipeline([RenderPipelineDescriptor ""PIXI Pipeline""]).

[Invalid BindGroupLayout (unlabeled)] is invalid.
 - While validating [BindGroupDescriptor] against [Invalid BindGroupLayout (unlabeled)]
 - While calling [Device].CreateBindGroup([BindGroupDescriptor]).

WebGPU: too many warnings, no more warnings will be reported to the console for this GPUDevice.
```

In the above example, WebGL's limit (`gl.MAX_TEXTURE_IMAGE_UNITS`) is 32 whereas WebGPU's limit (`device.limits.maxSampledTexturesPerShaderStage`) is 16. Specifically, the code in [getTextureBatchBindGroup.ts](https://github.com/pixijs/pixijs/blob/v8.9.2/src/rendering/batcher/gpu/getTextureBatchBindGroup.ts#L31):

```ts
if (!maxTextures)maxTextures = getMaxTexturesPerBatch();
```
and in [Batcher.ts](https://github.com/pixijs/pixijs/blob/v8.9.2/src/rendering/batcher/shared/Batcher.ts#L358):
```ts
Batcher.defaultOptions.maxTextures = Batcher.defaultOptions.maxTextures ?? getMaxTexturesPerBatch();
```
Both call [getMaxTexturesPerBatch()](https://github.com/pixijs/pixijs/blob/v8.9.2/src/rendering/batcher/gl/utils/maxRecommendedTextures.ts#L13) which relies on `gl.MAX_TEXTURE_IMAGE_UNITS`
## Workaround
Until PixiJS provides a fix for this, the best thing to do is check for mismatched limits and fallback to WebGL if there is a discrepancy. This can be done like so:

```ts
async function determineGraphicsAPI(): Promise<"webgpu" | "webgl"> {
	const adapter = await navigator.gpu?.requestAdapter().catch(() => null);
	const device = adapter && (await adapter.requestDevice().catch(() => null));
	if (!device) {
		return "webgl";
	}

	const canvas = document.createElement("canvas");
	const gl =
		(canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
		(canvas.getContext("webgl") as WebGLRenderingContext | null);

	// we have to return webgl so pixijs automatically falls back to canvas
	if (!gl) {
		return "webgl";
	}

	const webglMaxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
	const webgpuMaxTextures = device.limits.maxSampledTexturesPerShaderStage;

	return webglMaxTextures === webgpuMaxTextures ? "webgpu" : "webgl";
}

const pixiPreference = await determineGraphicsAPI();
const app = new Application();
await app.init({ background: '#1099bb', resizeTo: window, preference: pixiPreference });
```