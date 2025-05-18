import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/docs/layout.tsx", [route("docs", "routes/docs/docs.tsx")]),
] satisfies RouteConfig;
