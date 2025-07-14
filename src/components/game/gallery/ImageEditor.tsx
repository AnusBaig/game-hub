import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  HStack,
  VStack,
  Text as ChakraText,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  IconButton,
  ButtonGroup,
  Divider,
  useColorModeValue,
  useToast,
  Box,
  Input,
  Select,
} from "@chakra-ui/react";
import {
  FaSave,
  FaUndo,
  FaRedo,
  FaCrop,
  FaPalette,
  FaFont,
  FaPen,
  FaEraser,
  FaImage,
  FaSyncAlt,
} from "react-icons/fa";
import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas, FabricImage as FImage, FabricText as FText, filters } from "fabric";
import { MediaItem } from "../../../models/mediaItem";

interface Props {
  media: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImageUrl: string) => void;
}

const ImageEditor = ({ media, isOpen, onClose, onSave }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('none');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#ffffff');

  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Get proxy URL for CORS-safe image loading
  const getProxyUrl = useCallback((originalUrl: string): string => {
    const baseUrl = import.meta.env.DEV 
      ? 'http://localhost:3501' 
      : window.location.origin;
    
    return `${baseUrl}/api/proxy-media?url=${encodeURIComponent(originalUrl)}`;
  }, []);

  // Initialize Fabric.js canvas
  const initializeCanvas = useCallback(async () => {
    if (!canvasRef.current || !media.url) return;

    setIsLoading(true);
    try {
      // Create Fabric canvas
      const canvas = new Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: 'white',
      });

      fabricCanvasRef.current = canvas;

      // Load the image using proxy URL to avoid CORS issues
      const proxyUrl = getProxyUrl(media.url);
      FImage.fromURL(proxyUrl).then((img: FImage) => {
        if (!img) {
          toast({
            title: "Error loading image",
            description: "Failed to load the image for editing",
            status: "error",
            duration: 3000,
          });
          return;
        }

        // Scale image to fit canvas
        const scaleX = 800 / (img.width || 1);
        const scaleY = 600 / (img.height || 1);
        const scale = Math.min(scaleX, scaleY);

        img.scale(scale);
        img.set({
          left: (800 - (img.width || 0) * scale) / 2,
          top: (600 - (img.height || 0) * scale) / 2,
          selectable: false,
          evented: false,
        });

        canvas.add(img);
        canvas.renderAll();
        setIsLoading(false);
      }).catch((error: any) => {
        console.error('Error loading image:', error);
        toast({
          title: "Error loading image",
          description: "Failed to load the image for editing",
          status: "error",
          duration: 3000,
        });
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Canvas initialization error:', error);
      toast({
        title: "Editor initialization failed",
        description: "Unable to initialize the image editor",
        status: "error",
        duration: 3000,
      });
      setIsLoading(false);
    }
  }, [media.url, toast, getProxyUrl]);

  // Apply filters
  const applyFilter = useCallback((filterType: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const imageObj = objects.find((obj: any) => obj.type === 'image') as FImage;

    if (!imageObj) return;

    // Remove existing filters
    imageObj.filters = [];

    switch (filterType) {
      case 'grayscale':
        imageObj.filters.push(new filters.Grayscale());
        break;
      case 'sepia':
        imageObj.filters.push(new filters.Sepia());
        break;
      case 'invert':
        imageObj.filters.push(new filters.Invert());
        break;
      case 'vintage':
        imageObj.filters.push(
          new filters.Sepia(),
          new filters.Contrast({ contrast: 0.1 })
        );
        break;
    }

    // Apply brightness, contrast, saturation
    if (brightness !== 0) {
      imageObj.filters.push(new filters.Brightness({ brightness }));
    }
    if (contrast !== 0) {
      imageObj.filters.push(new filters.Contrast({ contrast }));
    }
    if (saturation !== 0) {
      imageObj.filters.push(new filters.Saturation({ saturation }));
    }

    imageObj.applyFilters();
    canvas.renderAll();
  }, [brightness, contrast, saturation]);

  // Tool handlers
  const handleToolSelect = useCallback((tool: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    setSelectedTool(tool);

    // Reset canvas mode
    canvas.isDrawingMode = false;
    canvas.selection = true;

    switch (tool) {
      case 'select':
        canvas.defaultCursor = 'default';
        break;
      case 'draw':
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.width = 3;
          canvas.freeDrawingBrush.color = strokeColor;
        }
        break;
      case 'text':
        canvas.defaultCursor = 'text';
        break;
      case 'crop':
        canvas.defaultCursor = 'crosshair';
        break;
    }
  }, [strokeColor]);

  // Add text
  const addText = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !textInput.trim()) return;

    const text = new FText(textInput, {
      left: 100,
      top: 100,
      fontSize: fontSize,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 1,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setTextInput('');
  }, [textInput, fontSize, fillColor, strokeColor]);

  // Rotate image
  const rotateImage = useCallback((direction: 'left' | 'right') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const imageObj = objects.find((obj: any) => obj.type === 'image');

    if (imageObj) {
      const currentAngle = imageObj.angle || 0;
      const newAngle = direction === 'left' ? currentAngle - 90 : currentAngle + 90;
      imageObj.rotate(newAngle);
      canvas.renderAll();
    }
  }, []);

  // Save edited image
  const handleSave = useCallback(async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    try {
      setIsLoading(true);
      
      // Export canvas as data URL
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 0.9,
        multiplier: 1,
      });

      onSave(dataURL);
      
      toast({
        title: "Image saved",
        description: "Your edited image has been saved",
        status: "success",
        duration: 3000,
      });

      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: "Unable to save the edited image",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [onSave, onClose, toast]);

  // Undo/Redo (simplified)
  const handleUndo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    if (objects.length > 1) { // Keep the base image
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  }, []);

  // Initialize canvas when modal opens
  useEffect(() => {
    if (isOpen && media.type === 'image') {
      initializeCanvas();
    }

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [isOpen, media.type, initializeCanvas]);

  // Apply filters when filter settings change
  useEffect(() => {
    if (fabricCanvasRef.current) {
      applyFilter(activeFilter);
    }
  }, [activeFilter, brightness, contrast, saturation, applyFilter]);

  if (media.type !== 'image') {
    return null;
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.900" />
      <ModalContent
        bg={bg}
        m={0}
        borderRadius={0}
        maxW="100vw"
        maxH="100vh"
      >
        <ModalHeader
          pb={2}
          borderBottom="1px"
          borderColor={borderColor}
        >
          <HStack justify="space-between" align="center">
            <ChakraText fontSize="lg" fontWeight="bold">
              Edit Image: {media.title || 'Untitled'}
            </ChakraText>
          </HStack>
        </ModalHeader>

        <ModalCloseButton />

        <ModalBody p={4} overflow="hidden">
          <HStack spacing={4} align="stretch" h="calc(100vh - 160px)">
            {/* Tools Panel */}
            <VStack
              w="250px"
              spacing={4}
              align="stretch"
              bg="gray.50"
              p={4}
              borderRadius="md"
              overflowY="auto"
            >
              {/* Tool Selection */}
              <VStack align="stretch" spacing={2}>
                <ChakraText fontWeight="bold" fontSize="sm">Tools</ChakraText>
                <ButtonGroup size="sm" variant="outline" spacing={1}>
                  <IconButton
                    aria-label="Select"
                    icon={<FaImage />}
                    isActive={selectedTool === 'select'}
                    onClick={() => handleToolSelect('select')}
                  />
                  <IconButton
                    aria-label="Draw"
                    icon={<FaPen />}
                    isActive={selectedTool === 'draw'}
                    onClick={() => handleToolSelect('draw')}
                  />
                  <IconButton
                    aria-label="Text"
                    icon={<FaFont />}
                    isActive={selectedTool === 'text'}
                    onClick={() => handleToolSelect('text')}
                  />
                  <IconButton
                    aria-label="Crop"
                    icon={<FaCrop />}
                    isActive={selectedTool === 'crop'}
                    onClick={() => handleToolSelect('crop')}
                  />
                </ButtonGroup>
              </VStack>

              <Divider />

              {/* Filters */}
              <VStack align="stretch" spacing={2}>
                <ChakraText fontWeight="bold" fontSize="sm">Filters</ChakraText>
                <Select 
                  size="sm" 
                  value={activeFilter} 
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="sepia">Sepia</option>
                  <option value="invert">Invert</option>
                  <option value="vintage">Vintage</option>
                </Select>
              </VStack>

              {/* Adjustments */}
              <VStack align="stretch" spacing={3}>
                <ChakraText fontWeight="bold" fontSize="sm">Adjustments</ChakraText>
                
                <Box>
                  <ChakraText fontSize="xs" mb={1}>Brightness: {brightness}</ChakraText>
                  <Slider
                    value={brightness}
                    onChange={setBrightness}
                    min={-1}
                    max={1}
                    step={0.1}
                    size="sm"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>

                <Box>
                  <ChakraText fontSize="xs" mb={1}>Contrast: {contrast}</ChakraText>
                  <Slider
                    value={contrast}
                    onChange={setContrast}
                    min={-1}
                    max={1}
                    step={0.1}
                    size="sm"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>

                <Box>
                  <ChakraText fontSize="xs" mb={1}>Saturation: {saturation}</ChakraText>
                  <Slider
                    value={saturation}
                    onChange={setSaturation}
                    min={-1}
                    max={1}
                    step={0.1}
                    size="sm"
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
              </VStack>

              <Divider />

              {/* Text Tool Options */}
              {selectedTool === 'text' && (
                <VStack align="stretch" spacing={2}>
                  <ChakraText fontWeight="bold" fontSize="sm">Text Options</ChakraText>
                  <Input
                    size="sm"
                    placeholder="Enter text..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <HStack>
                    <ChakraText fontSize="xs">Size:</ChakraText>
                    <Input
                      size="sm"
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      w="60px"
                    />
                  </HStack>
                  <HStack>
                    <ChakraText fontSize="xs">Fill:</ChakraText>
                    <Input
                      size="sm"
                      type="color"
                      value={fillColor}
                      onChange={(e) => setFillColor(e.target.value)}
                      w="50px"
                    />
                    <ChakraText fontSize="xs">Stroke:</ChakraText>
                    <Input
                      size="sm"
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      w="50px"
                    />
                  </HStack>
                  <Button size="sm" onClick={addText} isDisabled={!textInput.trim()}>
                    Add Text
                  </Button>
                </VStack>
              )}

              <Divider />

              {/* Transform */}
              <VStack align="stretch" spacing={2}>
                <ChakraText fontWeight="bold" fontSize="sm">Transform</ChakraText>
                <HStack>
                  <IconButton
                    aria-label="Rotate left"
                    icon={<FaSyncAlt />}
                    size="sm"
                    onClick={() => rotateImage('left')}
                    transform="scaleX(-1)"
                  />
                  <IconButton
                    aria-label="Rotate right"
                    icon={<FaSyncAlt />}
                    size="sm"
                    onClick={() => rotateImage('right')}
                  />
                </HStack>
              </VStack>
            </VStack>

            {/* Canvas Area */}
            <Box flex={1} display="flex" justifyContent="center" alignItems="center" bg="gray.100" borderRadius="md">
              <canvas
                ref={canvasRef}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              />
            </Box>
          </HStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <IconButton
              aria-label="Undo"
              icon={<FaUndo />}
              onClick={handleUndo}
              variant="ghost"
            />
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSave}
              isLoading={isLoading}
              loadingText="Saving..."
              leftIcon={<FaSave />}
            >
              Save
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImageEditor;