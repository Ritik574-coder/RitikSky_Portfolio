import ProjectCaseLayout from "../components/projects/ProjectCaseLayout";

export const project = {
  title: "Great Minds Knowledge Graph",
  category: "Computer Vision",
  heroImg: `${import.meta.env.BASE_URL}great-minds-knowledge-graph.webp`,
  tagline:
    "A TensorFlow-based image classification app that recognizes various vegetable types from uploaded photos, complete with confidence scores and Top-5 predictions in an interactive UI.",
  year: "2025",
  stack: ["TensorFlow / Keras", "Python", "Streamlit"],
  features: [
    "Simple image upload: supports drag & drop or file browse (JPG/JPEG/PNG) for instant classification.",
    "Primary prediction + confidence score: displays classification results that are easy for users to understand.",
    "Top-5 predictions: provides alternative predictions with score rankings for increased model transparency.",
    "Confidence visualization: confidence level bars to clarify how certain the model is about its predictions.",
    "Recognized class catalog: displays the list of vegetables the model can predict so users know the model's scope.",
    "Responsive and clean UI: focused on user experience to make the ML demo feel like a real product.",
  ],
  impact: [
    "Makes vegetable type identification from photos quick and easy - ideal for computer vision demos and AI education.",
    "Builds user trust as prediction results are displayed transparently through confidence scores and Top-5 rankings.",
    "Represents a complete end-to-end pipeline: from TensorFlow model training to deployment/inference in a web application.",
  ],
  links: {
    live: "https://ritik574-coder.github.io/Great-Minds-Knowledge-Graph/",
    repo: "https://github.com/Ritik574-coder/Great-Minds-Knowledge-Graph",
  },
};

export default function GreatMindsKnowledgeGraphDetail({ onClose, mode }) {
  return <ProjectCaseLayout project={project} onClose={onClose} closeLabel={mode === "modal" ? "Close" : "Back to Home"} mode={mode} />;
}
