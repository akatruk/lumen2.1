import type {
  LanguageCode,
  Platform,
  Product,
  ProductResumeCard,
} from "@/types";

export function serializeProductFields(input: {
  name: string;
  brand: string;
  category: string;
  description: string;
  imageEmoji?: string;
  priceLabel?: string;
  geography: string[];
  audience: string;
  languages: LanguageCode[];
  benefits: string[];
  prohibitedClaims: string[];
  desiredTopics: string[];
  platforms?: Platform[];
  resumeCard?: ProductResumeCard;
}) {
  return {
    name: input.name,
    brand: input.brand,
    category: input.category,
    description: input.description,
    imageEmoji: input.imageEmoji ?? "📦",
    priceLabel: input.priceLabel ?? "TBD",
    geographyJson: JSON.stringify(input.geography ?? []),
    audience: input.audience ?? "",
    languagesJson: JSON.stringify(input.languages ?? ["en"]),
    benefitsJson: JSON.stringify(input.benefits ?? []),
    prohibitedJson: JSON.stringify(input.prohibitedClaims ?? []),
    desiredTopicsJson: JSON.stringify(input.desiredTopics ?? []),
    platformsJson: JSON.stringify(input.platforms ?? ["douyin"]),
    resumeCardJson: input.resumeCard ? JSON.stringify(input.resumeCard) : null,
  };
}

export function dbProductToProduct(row: {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageEmoji: string;
  priceLabel: string;
  geographyJson: string;
  audience: string;
  languagesJson: string;
  benefitsJson: string;
  prohibitedJson: string;
  desiredTopicsJson: string;
  platformsJson: string;
  resumeCardJson: string | null;
  createdAt: Date;
}): Product {
  const parse = <T,>(raw: string, fallback: T): T => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  };
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    description: row.description,
    imageEmoji: row.imageEmoji,
    priceLabel: row.priceLabel,
    geography: parse(row.geographyJson, [] as string[]),
    audience: row.audience,
    languages: parse(row.languagesJson, ["en"] as LanguageCode[]),
    benefits: parse(row.benefitsJson, [] as string[]),
    prohibitedClaims: parse(row.prohibitedJson, [] as string[]),
    desiredTopics: parse(row.desiredTopicsJson, [] as string[]),
    platforms: parse(row.platformsJson, ["douyin"] as Platform[]),
    resumeCard: row.resumeCardJson
      ? parse<ProductResumeCard | undefined>(row.resumeCardJson, undefined)
      : undefined,
    createdAt: row.createdAt.toISOString(),
  };
}
