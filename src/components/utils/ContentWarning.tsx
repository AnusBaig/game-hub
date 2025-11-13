import { Badge, Box, Tooltip, HStack, Icon } from "@chakra-ui/react";
import { ContentScore } from "../../models/mediaItem";
import { WarningIcon, WarningTwoIcon } from "@chakra-ui/icons";
import contentModerationService from "../../services/contentModerationService";

interface Props {
  contentScore?: ContentScore;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

const ContentWarning = ({ contentScore, size = "md", showDetails = true }: Props) => {
  if (!contentScore) return null;

  const warning = contentModerationService.getContentWarning(contentScore);
  if (!warning && !showDetails) return null;

  // Determine badge color based on category
  const getBadgeColor = (category: string): string => {
    switch (category) {
      case 'explicit_adult':
      case 'erotic':
        return 'red';
      case 'adult':
        return 'orange';
      case 'mature':
      case 'brutal':
        return 'yellow';
      case 'partial':
      case 'suggestive':
      case 'cockeyed':
        return 'blue';
      case 'safe':
      default:
        return 'green';
    }
  };

  // Determine icon based on severity
  const getWarningIcon = (category: string) => {
    const highSeverity = ['explicit_adult', 'erotic', 'adult', 'brutal'];
    return highSeverity.includes(category) ? WarningTwoIcon : WarningIcon;
  };

  const badgeColor = getBadgeColor(contentScore.category);
  const WarningIconComponent = getWarningIcon(contentScore.category);

  // Get font size based on size prop
  const fontSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

  return (
    <Box>
      {warning && (
        <Tooltip
          label={warning}
          hasArrow
          placement="top"
          bg={`${badgeColor}.600`}
          color="white"
          fontSize="sm"
          p={3}
          borderRadius="md"
        >
          <Badge
            colorScheme={badgeColor}
            fontSize={fontSize}
            px={2}
            py={1}
            borderRadius="md"
            cursor="help"
            display="inline-flex"
            alignItems="center"
            gap={1}
          >
            <Icon as={WarningIconComponent} boxSize={3} />
            {contentScore.category.toUpperCase().replace('_', ' ')}
          </Badge>
        </Tooltip>
      )}

      {showDetails && contentScore.primaryContent !== 'safe' && (
        <HStack spacing={2} mt={2} flexWrap="wrap">
          {contentScore.nudityScore > 10 && (
            <Tooltip
              label={`Nudity Score: ${contentScore.nudityScore}%`}
              fontSize="xs"
            >
              <Badge colorScheme="red" fontSize="xs" cursor="help">
                Nudity: {contentScore.nudityScore}%
              </Badge>
            </Tooltip>
          )}

          {contentScore.weaponScore > 10 && (
            <Tooltip
              label={`Weapon/Violence Score: ${contentScore.weaponScore}%`}
              fontSize="xs"
            >
              <Badge colorScheme="orange" fontSize="xs" cursor="help">
                Violence: {contentScore.weaponScore}%
              </Badge>
            </Tooltip>
          )}

          {contentScore.alcoholScore > 10 && (
            <Tooltip
              label={`Alcohol/Substance Score: ${contentScore.alcoholScore}%`}
              fontSize="xs"
            >
              <Badge colorScheme="yellow" fontSize="xs" cursor="help">
                Alcohol: {contentScore.alcoholScore}%
              </Badge>
            </Tooltip>
          )}
        </HStack>
      )}
    </Box>
  );
};

export default ContentWarning;
