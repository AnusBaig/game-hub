import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  Text,
  VStack,
  useColorModeValue,
  Spinner,
  Badge,
  HStack,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import { BsSearch, BsClock, BsX } from "react-icons/bs";
import useGameQueryStore from "../../store";
import useSearchSuggestions from "../../hooks/useSearchSuggestions";
import { getStringArray, setStringArray } from "../../utils/localStorage";

interface SearchSuggestion {
  id: number;
  name: string;
  type: "game";
  released?: string;
  background_image?: string;
}

const EnhancedSearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const setSearch = useGameQueryStore((s) => s.setSearch);
  const currentSearch = useGameQueryStore((s) => s.gameQuery.search);

  const { data: suggestions, isLoading } = useSearchSuggestions(searchTerm);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    // Load recent searches from localStorage with error handling
    const stored = getStringArray("gameHubRecentSearches", []);
    setRecentSearches(stored);
  }, []);

  useEffect(() => {
    // Set initial search term from store
    if (currentSearch) {
      setSearchTerm(currentSearch);
    }
  }, [currentSearch]);

  const handleSearch = (term: string) => {
    if (term.trim()) {
      setSearch(term);
      addToRecentSearches(term);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const addToRecentSearches = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    
    // Attempt to save to localStorage with error handling
    const saved = setStringArray("gameHubRecentSearches", updated);
    if (!saved) {
      console.warn('Failed to save recent search to localStorage');
      // Component continues to work without localStorage
    }
  };

  const removeFromRecentSearches = (term: string) => {
    const updated = recentSearches.filter(s => s !== term);
    setRecentSearches(updated);
    
    // Attempt to save to localStorage with error handling
    const saved = setStringArray("gameHubRecentSearches", updated);
    if (!saved) {
      console.warn('Failed to update recent searches in localStorage');
      // Component continues to work without localStorage
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const totalItems = (suggestions?.length || 0) + recentSearches.length;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < recentSearches.length) {
            handleSearch(recentSearches[selectedIndex]);
          } else {
            const suggestion = suggestions?.[selectedIndex - recentSearches.length];
            if (suggestion) {
              handleSearch(suggestion.name);
            }
          }
        } else {
          handleSearch(searchTerm);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearch("");
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  return (
    <Box position="relative" className="w-100">
      <form onSubmit={handleSubmit}>
        <InputGroup boxShadow="2xl">
          <InputLeftElement children={<BsSearch />} />
          <Input
            ref={searchRef}
            placeholder="Search games..."
            borderRadius={20}
            variant="filled"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={(e) => {
              // Delay hiding suggestions to allow for clicks
              setTimeout(() => {
                if (!suggestionsRef.current?.contains(e.relatedTarget as Node)) {
                  setShowSuggestions(false);
                }
              }, 150);
            }}
            onKeyDown={handleKeyDown}
            pr={searchTerm ? "40px" : "16px"}
          />
          {searchTerm && (
            <IconButton
              aria-label="Clear search"
              icon={<BsX />}
              size="sm"
              variant="ghost"
              position="absolute"
              right="8px"
              top="50%"
              transform="translateY(-50%)"
              onClick={clearSearch}
              zIndex={2}
            />
          )}
        </InputGroup>
      </form>

      {showSuggestions && (searchTerm || recentSearches.length > 0) && (
        <Box
          ref={suggestionsRef}
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          mt={1}
          maxH="400px"
          overflowY="auto"
          zIndex={10}
          boxShadow="lg"
        >
          <VStack align="stretch" spacing={0}>
            {/* Recent Searches */}
            {recentSearches.length > 0 && !searchTerm && (
              <>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.500"
                  px={4}
                  py={2}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                >
                  Recent Searches
                </Text>
                {recentSearches.map((term, index) => (
                  <Box
                    key={`recent-${index}`}
                    px={4}
                    py={2}
                    cursor="pointer"
                    bg={selectedIndex === index ? hoverBg : "transparent"}
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleSearch(term)}
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <BsClock size={14} />
                        <Text>{term}</Text>
                      </HStack>
                      <IconButton
                        aria-label="Remove from recent"
                        icon={<BsX />}
                        size="xs"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromRecentSearches(term);
                        }}
                      />
                    </HStack>
                  </Box>
                ))}
              </>
            )}

            {/* Search Suggestions */}
            {searchTerm && (
              <>
                {isLoading && (
                  <Box px={4} py={2} textAlign="center">
                    <Spinner size="sm" />
                  </Box>
                )}
                
                {suggestions && suggestions.length > 0 && (
                  <>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.500"
                      px={4}
                      py={2}
                      borderBottom="1px solid"
                      borderColor={borderColor}
                    >
                      Games
                    </Text>
                    {suggestions.map((suggestion, index) => (
                      <Box
                        key={`suggestion-${suggestion.id}`}
                        px={4}
                        py={2}
                        cursor="pointer"
                        bg={selectedIndex === recentSearches.length + index ? hoverBg : "transparent"}
                        _hover={{ bg: hoverBg }}
                        onClick={() => handleSearch(suggestion.name)}
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{suggestion.name}</Text>
                          {suggestion.released && (
                            <Text fontSize="xs" color="gray.500">
                              Released: {new Date(suggestion.released).getFullYear()}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </>
                )}
                
                {searchTerm && !isLoading && (!suggestions || suggestions.length === 0) && (
                  <Text px={4} py={2} color="gray.500" textAlign="center">
                    No suggestions found
                  </Text>
                )}
              </>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default EnhancedSearchInput;