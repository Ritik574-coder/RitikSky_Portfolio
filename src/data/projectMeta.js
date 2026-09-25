export const PROJECT_META = [
  {
    id: 1,
    slug: "dbt-analytics-engineering",
    title: "Retail Analytics Engineering Platform",
    category: "Analytics Engineering / Data Engineering",
    color: "bg-[#A8FF00]",
    img: `${import.meta.env.BASE_URL}dbt-analytics-engineering-overview.webp`,
  },
  {
    id: 2,
    slug: "leadsup",
    title: "LeadsUp",
    category: "AI-Powered Lead Scoring",
    color: "bg-purple-400",
    img: "https://res.cloudinary.com/demlxsf08/image/upload/v1766486297/Gemini_Generated_Image_t441sjt441sjt441_pwjtsx.png",
  },
  {
    id: 3,
    slug: "polsekrembang",
    title: "Polsek Rembang Virtual Assistant",
    category: "RAG Chatbot / AI Assistant",
    color: "bg-orange-400",
    img: "https://res.cloudinary.com/demlxsf08/image/upload/v1766488043/Gemini_Generated_Image_3s3kqp3s3kqp3s3k_iytop1.png",
  },
  {
    id: 4,
    slug: "floodsegmen",
    title: "Flood Segmentation Analyzer",
    category: "Computer Vision",
    color: "bg-blue-400",
    img: "https://res.cloudinary.com/demlxsf08/image/upload/v1766488542/Gemini_Generated_Image_v501i1v501i1v501_wao1dj.png",
  },
  {
    id: 5,
    slug: "qmeal",
    title: "QMeal E-Kantin",
    category: "Multi-Vendor Ordering Platform",
    color: "bg-pink-400",
    img: "https://res.cloudinary.com/demlxsf08/image/upload/v1766489013/Gemini_Generated_Image_t52vclt52vclt52v_z5p8vi.png",
  },
  {
    id: 6,
    slug: "lostandfound",
    title: "SITEMU Lost & Found Portal",
    category: "Web Application",
    color: "bg-cyan-400",
    img: "https://res.cloudinary.com/demlxsf08/image/upload/v1766489701/Gemini_Generated_Image_v54x4rv54x4rv54x_mloefz.png",
  },
  {
    id: 7,
    slug: "imageclas",
    title: "Vegetable Image Classification",
    category: "Computer Vision",
    color: "bg-green-400",
    img: "https://res.cloudinary.com/demlxsf08/image/upload/v1766490520/Gemini_Generated_Image_s7woxks7woxks7wo_klw9jh.png",
  },
  {
    id: 8,
    slug: "financial-assistant-bot",
    title: "Financial Assistant Bot",
    category: "AI / Fintech",
    color: "bg-amber-400",
    img: "https://res.cloudinary.com/dujp9ydkx/image/upload/f_auto,q_auto/v1771095470/demo_1_clhmqw",
  },
];

export const PROJECT_META_BY_SLUG = PROJECT_META.reduce((accumulator, item) => {
  accumulator[item.slug] = item;
  return accumulator;
}, {});
