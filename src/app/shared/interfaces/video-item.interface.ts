export interface VideoItem {
  title: string;
  link: string;
  videoId: string;
  thumbnail: string;
  description: string;
  published: string;
  channelTitle: string;
  channelLink: string;
  channelAvatar: string;
}

/** A video slot that may still be loading; `null` renders the skeleton card. */
export type VideoSlot = VideoItem | null;
