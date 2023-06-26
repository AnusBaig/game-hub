import { Box, Button, HStack, Image, Tooltip, Icon } from "@chakra-ui/react";
import _ from "lodash";
import useGameTrailers from "../../../hooks/useGameTrailers";
import useGameTrailerStore from "./gameTrailerStore";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";

interface Props {
  gameId: number;
}

const TrailerCarousel = ({ gameId }: Props) => {
  const { data: trailers } = useGameTrailers(gameId);
  const { trailerId, setTrailerId } = useGameTrailerStore();

  if (!trailers) return null;

  const trailerCycles = _.chunk(trailers.results, 8);

  return (
    <Box
      id='trailerCarousel'
      className='carousel slide'
      data-bs-touch='false'
      data-bs-interval='false'
      my={10}
    >
      <Box className='carousel-inner' textAlign='center'>
        {trailerCycles.map((trailers, index) => (
          <HStack
            key={index}
            className='carousel-item active'
            justifyContent='space-around'
          >
            {trailers.length > 1 &&
              trailers.map((trailer) => (
                <Tooltip label={trailer.name} key={trailer.id}>
                  <Image
                    src={trailer?.preview}
                    alt={trailer.name}
                    onClick={() => setTrailerId(trailer.id)}
                    boxSize={200}
                    objectFit='cover'
                    display='inline-block'
                    filter={trailerId !== trailer.id ? "grayscale(50%)" : ""}
                  />
                </Tooltip>
              ))}
          </HStack>
        ))}
      </Box>
      {trailerCycles.length > 1 ? (
        <>
          <button
            className='carousel-control-prev'
            data-bs-target='#trailerCarousel'
            data-bs-slide='prev'
          >
            <Icon as={MdChevronLeft} color='white.500' width={20} height={20} />
          </button>
          <button
            className='carousel-control-next'
            data-bs-target='#trailerCarousel'
            data-bs-slide='next'
          >
            <Icon
              as={MdChevronRight}
              color='white.500'
              width={20}
              height={20}
            />
          </button>
        </>
      ) : null}
    </Box>
  );
};

export default TrailerCarousel;
