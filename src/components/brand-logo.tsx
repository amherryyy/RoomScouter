type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      className={className}
      src="/roomscouter-logo.png"
      width="2000"
      height="1000"
      alt=""
    />
  );
}
