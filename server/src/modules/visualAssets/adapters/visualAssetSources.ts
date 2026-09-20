import type {
  VisualAssetKind,
  VisualAssetOrigin,
  VisualAssetScopeKind,
  VisualAssetSourceDomain,
} from "@ai-novel/shared/types/visualAsset";
import { prisma } from "../../../db/prisma";
import { buildImageAssetPublicUrl } from "../../../services/image/imageAssetStorage";

export interface VisualAssetSourceItem {
  sourceDomain: VisualAssetSourceDomain;
  sourceType: string;
  sourceId: string;
  sourceVersion: string;
  sourceLabel: string;
  scopeKind: VisualAssetScopeKind;
  scopeId: string | null;
  scopeLabel: string | null;
  kind: VisualAssetKind;
  origin: VisualAssetOrigin;
  url: string;
  thumbnailUrl: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  prompt: string | null;
  provider: string | null;
  model: string | null;
  isPrimary: boolean;
  sourceCreatedAt: Date;
  metadata: Record<string, unknown>;
}

function sceneKind(sceneType: string): VisualAssetKind {
  if (sceneType === "novel_cover") return "cover";
  if (sceneType === "chapter_illustration") return "illustration";
  return "character";
}

async function readImageAssetSources(): Promise<VisualAssetSourceItem[]> {
  const rows = await prisma.imageAsset.findMany({
    include: {
      baseCharacter: { select: { name: true } },
      novel: { select: { title: true } },
      bookAnalysisCharacter: {
        select: {
          name: true,
          analysis: { select: { id: true } },
        },
      },
    },
  });
  return rows.map((asset) => {
    const isNovelCover = asset.sceneType === "novel_cover";
    const isBookCharacter = asset.sceneType === "book_analysis_character";
    const scopeKind: VisualAssetScopeKind = isNovelCover ? "novel" : isBookCharacter ? "book_analysis" : "global";
    const scopeId = isNovelCover ? asset.novelId : isBookCharacter ? asset.bookAnalysisCharacter?.analysis.id ?? null : null;
    const scopeLabel = isNovelCover ? asset.novel?.title ?? "小说" : isBookCharacter ? "拆书分析" : "基础角色库";
    const sourceLabel = isNovelCover
      ? `${asset.novel?.title ?? "小说"} · 封面`
      : isBookCharacter
        ? `${asset.bookAnalysisCharacter?.name ?? "拆书角色"} · 角色形象`
        : `${asset.baseCharacter?.name ?? "基础角色"} · 角色形象`;
    return {
      sourceDomain: "image_asset" as const,
      sourceType: "image_asset",
      sourceId: asset.id,
      sourceVersion: "current",
      sourceLabel,
      scopeKind,
      scopeId,
      scopeLabel,
      kind: sceneKind(asset.sceneType),
      origin: "generated" as const,
      url: buildImageAssetPublicUrl(asset.id),
      thumbnailUrl: buildImageAssetPublicUrl(asset.id),
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
      prompt: asset.prompt,
      provider: asset.provider,
      model: asset.model,
      isPrimary: asset.isPrimary,
      sourceCreatedAt: asset.createdAt,
      metadata: { sceneType: asset.sceneType },
    };
  });
}

export async function collectVisualAssetSources(): Promise<VisualAssetSourceItem[]> {
  return readImageAssetSources();
}
