import { Image, ImageProps } from "@chakra-ui/react";
import meh from "../../assets/meh.webp";
import thumbsUp from "../../assets/thumbs-up.webp";
import bullsEye from "../../assets/bulls-eye.webp";

interface Props {
  rating: number;
}

const Rating = ({ rating }: Props) => {
  const emojiMap: { [key: number]: ImageProps } = {
    3: { src: meh, alt: "Image of Meh", boxSize: 10 },
    4: { src: thumbsUp, alt: "Image of ThumbsUp", boxSize: 12 },
    5: { src: bullsEye, alt: "Image of BullsEyes", boxSize: 12 },
  };

  return <Image {...emojiMap[rating]} />;
};

export default Rating;
