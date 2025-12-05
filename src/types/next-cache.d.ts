import "next/cache";

declare module "next/cache" {
  // extend the allowed profile-name union
  export type CacheLifeProfileName =
    | "seconds"
    | "minutes"
    | "hours"
    | "days"
    | "weeks"
    | "max"
    | "dashboard"
    | "content"
    | "realtime"
    | "static";
}