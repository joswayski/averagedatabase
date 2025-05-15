import { Welcome } from "../welcome/welcome"

export function meta({}) {
  return [
    { title: "Average Database" },
    { name: "description", content: "The world's fastest, most secure, scalable, reliable, free-est, open source database platform" },
  ];
}

export default function Home() {
  return <Welcome />
}
