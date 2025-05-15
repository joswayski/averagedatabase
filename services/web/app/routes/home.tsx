import { Welcome } from "../welcome/welcome"

export function meta({}) {
  return [
    { title: "Average Database" },
    { name: "description", content: "The world's most performant, secure, scalable, reliable, free-est, open source data platform" },
  ];
}

export default function Home() {
  return <Welcome />
}
