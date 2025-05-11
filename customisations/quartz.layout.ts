import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// shared mapFn logic for Explorer components
// shared mapFn logic for Explorer components
const explorerMapFn = (node) => {
  if (node.isFolder) {
    switch (node.displayName) {
      case "Knowledge":
        node.displayName = "🧠 Knowledge";
        break;
      case "Projects":
        node.displayName = "📝 Projects";
        break;
      case "Cloud":
        node.displayName = "☁️ Cloud";
        break;
      case "Blockchain":
        node.displayName = "⛓️ Blockchain";
        break;
      case "Networking":
        node.displayName = "🌐 Networking";
        break;
      case "Software Licensing":
        node.displayName = "📜 Software Licensing";
        break;
      case "Telephony Systems":
        node.displayName = "📞 Telephony Systems";
        break;
      case "Operating Systems":
        node.displayName = "🖥️ Operating Systems";
        break;
      case "Artificial Intelligence":
        node.displayName = "🤖 Artificial Intelligence";
        break;
      case "Programming":
        node.displayName = "🧑🏼‍💻 Programming";
        break;
      case "DevSecOps & Platforms":
        node.displayName = "🚀 DevSecOps & Platforms";
        break;
      case "Cybersecurity":
        node.displayName = "🛡️ Cybersecurity";
        break;
      default:
        break;
    }
  }
};


// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/anthops/anthopedia"
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      mapFn: explorerMapFn,
    }),
  ],
  right: [
    Component.ConditionalRender({
      component: Component.Graph({
        localGraph: {
          depth: 2,
        },
        globalGraph: {
          scale: 1.1,
          enableRadial: true,
        },
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.Graph({
        localGraph: {
          depth: -1,
          enableRadial: true
        }
      }),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      mapFn: explorerMapFn,
    }),
  ],
  right: [],
}



