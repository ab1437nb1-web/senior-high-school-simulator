// 由 scripts/install-events.mjs 生成，请勿手工编辑。
// 真正的数据在 events.overrides.json：added 新事件、overrides 覆盖、deleted 删除。
import type { StoryEvent } from "./types";
import data from "./events.overrides.json";

export const GENERATED_EVENTS = (data.added || []) as unknown as StoryEvent[];
export const EVENT_OVERRIDES = (data.overrides || {}) as unknown as Record<string, StoryEvent>;
export const EVENT_DELETED = (data.deleted || []) as string[];
