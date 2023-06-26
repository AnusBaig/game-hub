import { Box, HStack, Icon, Image, Tooltip } from "@chakra-ui/react";
import _ from "lodash";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import useGameTrailers from "../../../hooks/useGameTrailers";
import useGameTrailerStore from "./gameTrailerStore";
import { useState } from "react";

interface Props {
  gameId: number;
}

const TrailerCarousel = ({ gameId }: Props) => {
  const [selectedCycle, setSelectedCycle] = useState(1);

  const { data: trailers } = useGameTrailers(gameId);
  let { trailerId, setTrailerId } = useGameTrailerStore();

  if (!trailers) return null;

  const trailerCycles = _.chunk(trailers.results, 3);
  if (!trailerId) trailerId = trailers.results.at(0)?.id;

  const handleNextCycle = () =>
    selectedCycle < trailerCycles.length && setSelectedCycle(selectedCycle + 1);
  const handlePreviousCycle = () =>
    trailerCycles.length && setSelectedCycle(selectedCycle - 1);

  return (
    <Box
      id='trailerCarousel'
      className='carousel slide'
      data-bs-touch='false'
      data-bs-interval='false'
      my={6}
    >
      <Box className='carousel-inner' textAlign='center'>
        {trailerCycles.map((trailers, index) => (
          <HStack
            key={index}
            className={`carousel-item ${
              selectedCycle === index + 1 ? "active" : ""
            }`}
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
            onClick={handlePreviousCycle}
          >
            <Icon as={MdChevronLeft} color='white.500' width={16} height={16} />
          </button>
          <button
            className='carousel-control-next'
            data-bs-target='#trailerCarousel'
            data-bs-slide='next'
            onClick={handleNextCycle}
          >
            <Icon
              as={MdChevronRight}
              color='white.500'
              width={16}
              height={16}
            />
          </button>
        </>
      ) : null}
    </Box>
  );
};

export default TrailerCarousel;
