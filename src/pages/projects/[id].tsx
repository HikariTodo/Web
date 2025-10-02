import { useParams } from "@solidjs/router";

export default function View() {
  const params = useParams<{ id: string }>();

  return <div>{params.id}</div>;
}
