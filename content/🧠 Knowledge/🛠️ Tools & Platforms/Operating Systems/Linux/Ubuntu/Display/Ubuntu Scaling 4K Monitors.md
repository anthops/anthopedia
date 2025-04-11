---
title: Ubuntu Scaling 4K Monitors
tags:
  - ubuntu
---
When using 4K monitors Ubuntu will appear extremely zoomed out, making it difficult to use. There is a way to scale up via the settings as seen below:

![[display-settings.png|650]]

However, anything above 100% is very zoomed in and personally I think it looks bad. You might think that enabling Fractional Scaling and setting the scale to 125% or 150% would be sufficient, and I don't blame you for thinking that - I did too. However, the fractional scaling does something a little unexpected.

Unfortunately, GNOME can't do fractional scaling *natively*. Instead, it renders the desktop at a higher internal resolution and downscales it to the display resolution. This causes a 4K monitor to go from `3840x2160` to `5120x2880` when fractionally scaled by 150%, resulting in quite the performance hit with my setup of 3 monitors at 4K resolution, even with a beefy GPU.
## A workaround
Instead of using fractional scaling we can make use of some gnome tweaks to scale up text and icons, resulting in a similar result that is much more efficient and smooth. The first thing to do (if you don't have it already) is to install gnome-tweaks:
```sh
sudo apt install gnome-tweaks
```
Open Gnome Tweaks and navigate to Fonts. You should find the following:

![[gnome-tweaks-font-size.png|500]]

Increasing this to the desired scale actually works very well - I have it set to 1.5 to get a similar affect to 150% fractional scaling. The reason for this is because many GNOME/GTK apps adjust their layouts when font size changes, resulting in the GUI seemingly scaling with the font size.

After changing the font size, navigate to the Ubuntu settings and Ubuntu Desktop where you can scale up the Icon Size in the dock:

![[dock-icon-scale.png|650]]

You can also change the cursor size in the accessibility settings under `Seeing`:

![[cursor-size.png|650]]

Congratulations, you now have a "fractionally" scaled Ubuntu without the rendering overhead on the GPU!