export interface Creator {
  handle: string;
  name: string;
  avatar: string;
  followers: number;
  skillsPublished: number;
  totalInvocations: number;
}

export const TOP_CREATORS: Creator[] = [
  {
    handle: "@cipherforge",
    name: "Cipher Forge",
    avatar: "CF",
    followers: 12480,
    skillsPublished: 7,
    totalInvocations: 86420,
  },
  {
    handle: "@atlaslabs",
    name: "Atlas Labs",
    avatar: "AT",
    followers: 9320,
    skillsPublished: 5,
    totalInvocations: 64180,
  },
  {
    handle: "@helixnodes",
    name: "Helix Nodes",
    avatar: "HX",
    followers: 7860,
    skillsPublished: 4,
    totalInvocations: 48910,
  },
  {
    handle: "@meshstudio",
    name: "Mesh Studio",
    avatar: "MS",
    followers: 6420,
    skillsPublished: 6,
    totalInvocations: 41320,
  },
];
