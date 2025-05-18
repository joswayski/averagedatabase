import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/docs/layout.tsx", [route("docs", "routes/docs/docs.tsx")]),
  layout("routes/blog/layout.tsx", [
    route("blog", "routes/blog/blog.tsx"),
    route("blog/we-rich-lmao", "routes/blog/we-rich-lmao.tsx"),
    route("blog/oops-we-did-it-again", "routes/blog/oops-we-did-it-again.tsx"),
  ]),
] satisfies RouteConfig;
