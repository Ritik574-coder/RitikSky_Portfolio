import { lazy } from "react";
import { PROJECT_META_BY_SLUG } from "../data/projectMeta";

const PROJECT_DETAIL_COMPONENTS = {
  "dbt-analytics-engineering": lazy(() => import("./RetailAnalyticsEngineeringPlatformDetail")),
  leadsup: lazy(() => import("./SkyNovaIntelligentDataEcosystemDetail")),
  polsekrembang: lazy(() => import("./MedallionDataWarehouseDetail")),
  floodsegmen: lazy(() => import("./SnowflakeSemiStructuredDataNormalizationDetail")),
  qmeal: lazy(() => import("./SqlServerDataWarehouseDetail")),
  lostandfound: lazy(() => import("./BusinessIntelligenceAnalyticsDashboardDetail")),
  imageclas: lazy(() => import("./GreatMindsKnowledgeGraphDetail")),
  "financial-assistant-bot": lazy(() => import("./HumanBehaviorNetworkDetail")),
};

export function getProjectRouteConfig(slug) {
  const metadata = PROJECT_META_BY_SLUG[slug];
  if (!metadata) return null;

  return {
    ...metadata,
    Component: PROJECT_DETAIL_COMPONENTS[slug],
  };
}
