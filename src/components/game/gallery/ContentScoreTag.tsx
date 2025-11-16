import { Badge, Box, Tooltip } from "@chakra-ui/react";
import { ContentScore } from "../../../models/mediaItem";

interface Props {
  score: ContentScore;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetailedTooltip?: boolean;
}

const ContentScoreTag = ({ score, position = 'top-right', showDetailedTooltip = false }: Props) => {
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 10,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: 2, left: 2 };
      case 'top-right':
        return { ...baseStyles, top: 2, right: 2 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 2, left: 2 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 2, right: 2 };
      default:
        return { ...baseStyles, top: 2, right: 2 };
    }
  };

  const getColorScheme = () => {
    // If safe content, always use green
    if (score.primaryContent === 'safe') {
      return 'green';
    }

    // Color scheme based on content type and severity
    switch (score.primaryContent) {
      case 'nudity':
        // Use nudity category for color
        switch (score.category) {
          case 'safe':
            return 'green';
          case 'suggestive':
            return 'yellow';
          case 'partial':
            return 'orange';
          case 'explicit':
            return 'red';
          case 'erotic':
            return 'pink'; // Deep pink/magenta for erotic content
          default:
            return 'gray';
        }
      case 'weapon':
        // Weapon content color based on category
        if (score.category === 'brutal') return 'red'; // Dark red for brutal
        return score.primaryScore >= 30 ? 'red' : 'orange';
      case 'alcohol':
        // Alcohol content color based on category
        if (score.category === 'cockeyed') return 'orange'; // Dark orange for cockeyed
        return score.primaryScore >= 20 ? 'orange' : 'yellow';
      default:
        return 'gray';
    }
  };

  const getDisplayText = () => {
    // Don't show anything for safe content
    if (score.primaryContent === 'safe') {
      return '';
    }

    const percentage = Math.round(score.primaryScore);
    
    // Add content type icon/prefix
    switch (score.primaryContent) {
      case 'nudity':
        return `♀️ ${percentage}%`;
      case 'weapon':
        return `🔫 ${percentage}%`;
      case 'alcohol':
        return `🍺 ${percentage}%`;
      default:
        return `${percentage}%`;
    }
  };

  const getTooltipText = () => {
    const confidence = Math.round(score.confidence * 100);
    
    // Simple tooltip for media gallery
    if (!showDetailedTooltip) {
      if (score.primaryContent === 'safe') {
        return 'Safe content';
      }
      
      const contentTypeName = score.primaryContent.charAt(0).toUpperCase() + score.primaryContent.slice(1);
      const percentage = Math.round(score.primaryScore);
      
      // Show category name for high scores (>85%)
      if (score.primaryScore > 85 && (score.category === 'erotic' || score.category === 'brutal' || score.category === 'cockeyed')) {
        const categoryName = score.category.charAt(0).toUpperCase() + score.category.slice(1);
        return `${contentTypeName}: ${percentage}% (${categoryName})`;
      }
      
      return `${contentTypeName}: ${percentage}%`;
    }
    
    // Detailed tooltip for media viewer
    let tooltip = `Content Type: ${score.primaryContent.charAt(0).toUpperCase() + score.primaryContent.slice(1)}\n`;
    
    if (score.primaryContent === 'safe') {
      tooltip += `All content scores are low\n`;
    } else {
      tooltip += `Primary Score: ${Math.round(score.primaryScore)}%\n`;
      
      // Show category for high scores
      if (score.primaryScore > 85 && (score.category === 'erotic' || score.category === 'brutal' || score.category === 'cockeyed')) {
        const categoryName = score.category.charAt(0).toUpperCase() + score.category.slice(1);
        tooltip += `Category: ${categoryName}\n`;
      }
    }
    
    // Always show breakdown of all scores
    tooltip += `\nScore Breakdown:\n`;
    tooltip += `• Nudity: ${Math.round(score.nudityScore)}%\n`;
    tooltip += `• Weapons: ${Math.round(score.weaponScore)}%\n`;
    tooltip += `• Alcohol: ${Math.round(score.alcoholScore)}%\n`;
    tooltip += `\nConfidence: ${confidence}%`;
    
    return tooltip;
  };

  // Don't render anything for safe content
  if (score.primaryContent === 'safe') {
    return null;
  }

  return (
    <Box sx={getPositionStyles()}>
      <Tooltip 
        label={getTooltipText()} 
        placement="bottom"
        bg="gray.800"
        color="white"
        fontSize="sm"
        whiteSpace="pre-line"
      >
        <Badge
          colorScheme={getColorScheme()}
          variant="solid"
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="md"
          cursor="help"
          opacity={0.9}
          _hover={{ opacity: 1 }}
        >
          {getDisplayText()}
        </Badge>
      </Tooltip>
    </Box>
  );
};

export default ContentScoreTag;