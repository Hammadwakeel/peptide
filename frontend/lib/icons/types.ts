import type { SVGProps } from "react";

export type FrontierIconPaths = {
  base: string;
  overlay: string;
};

export type FrontierIconProps = {
  className?: string;
  size?: number;
  /** White fills for active sidebar circle */
  active?: boolean;
  "aria-hidden"?: boolean | "true" | "false";
} & Pick<SVGProps<SVGSVGElement>, "role">;

export type FrontierIconComponent = (props: FrontierIconProps) => React.ReactElement;
