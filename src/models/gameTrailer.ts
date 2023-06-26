export default interface GameTrailer {
  id: number;
  name: string;
  preview: string;
  data: GameTrailerVideo;
}

interface GameTrailerVideo {
  480: string;
  max: string;
}
