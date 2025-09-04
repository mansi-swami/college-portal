//@ts-ignore
import { HTMLAttributes } from "react";

export default function VisuallyHidden(props: HTMLAttributes<HTMLSpanElement>) {
  return <span className="sr-only" {...props} />;
}
