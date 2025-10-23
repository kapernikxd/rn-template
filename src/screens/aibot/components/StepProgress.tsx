import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThemeType, TypographytType, SizesType, useTheme } from "rn-vs-lb/theme";

interface StepProgressProps {
  steps: { title: string; description?: string }[];
  activeStep: number;
}

export const StepProgress: React.FC<StepProgressProps> = ({ steps, activeStep }) => {
  const { theme, typography, sizes } = useTheme();

  const styles = useMemo(
    () => createStyles({ theme, typography, sizes }),
    [theme, typography, sizes],
  );

  const currentDescription = steps[activeStep]?.description ?? "";

  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          return (
            <View key={step.title ?? index} style={styles.stepItem}>
              <View style={styles.stepHeader}>
                <View
                  style={[
                    styles.circle,
                    (isActive || isCompleted) && styles.circleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.circleText,
                      (isActive || isCompleted) && styles.circleTextActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                {index < steps.length - 1 ? (
                  <View
                    style={[
                      styles.connector,
                      (isCompleted || (isActive && activeStep === index)) && styles.connectorActive,
                    ]}
                  />
                ) : null}
              </View>
              <Text
                numberOfLines={2}
                style={[styles.stepTitle, isActive && styles.stepTitleActive]}
              >
                {step.title}
              </Text>
            </View>
          );
        })}
      </View>
      {currentDescription ? (
        <Text style={styles.description}>{currentDescription}</Text>
      ) : null}
    </View>
  );
};

const createStyles = ({
  theme,
  typography,
  sizes,
}: {
  theme: ThemeType;
  typography: TypographytType;
  sizes: SizesType;
}) =>
  StyleSheet.create({
    container: {
      marginBottom: sizes.xl as number,
    },
    stepsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    stepItem: {
      flex: 1,
      marginRight: sizes.sm as number,
    },
    stepHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: sizes.xs as number,
    },
    circle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.white,
    },
    circleActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary,
    },
    circleText: {
      ...typography.bodyXs,
      color: theme.text,
      fontWeight: "600",
    },
    circleTextActive: {
      color: theme.white,
    },
    connector: {
      flex: 1,
      height: 2,
      marginLeft: sizes.xs as number,
      backgroundColor: theme.border,
    },
    connectorActive: {
      backgroundColor: theme.primary,
    },
    stepTitle: {
      ...typography.bodyXs,
      color: theme.greyText,
    },
    stepTitleActive: {
      color: theme.text,
      fontWeight: "600",
    },
    description: {
      marginTop: sizes.sm as number,
      ...typography.bodySm,
      color: theme.greyText,
    },
  });

