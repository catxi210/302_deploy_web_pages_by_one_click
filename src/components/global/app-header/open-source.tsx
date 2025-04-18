import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useIsHideBrand } from "@/hooks/global/use-is-hide-brand";

export default function OpenSource() {
  const isHideBrand = useIsHideBrand();
  if (isHideBrand) return null;
  return (
    <Button
      variant="icon"
      size="roundIconSm"
      onClick={() => window.open('https://github.com/302ai/302_deploy_web_pages_by_one_click')}
    >
      <FaGithub className="size-4" />
    </Button>
  );
}
