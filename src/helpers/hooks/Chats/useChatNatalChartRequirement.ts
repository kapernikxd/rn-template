import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { getStoredNatalChart } from '../../astrology/natalChartStorage';

export const useChatNatalChartRequirement = () => {
  const [isCheckingNatalChart, setIsCheckingNatalChart] = useState(true);
  const [isNatalChartModalVisible, setIsNatalChartModalVisible] = useState(false);

  const checkNatalChart = useCallback(() => {
    let isMounted = true;

    const run = async () => {
      setIsCheckingNatalChart(true);
      try {
        const stored = await getStoredNatalChart();
        if (!isMounted) return;
        setIsNatalChartModalVisible(!stored);
      } catch (error) {
        if (!isMounted) return;
        console.warn('Failed to check stored natal chart', error);
        setIsNatalChartModalVisible(true);
      } finally {
        if (isMounted) {
          setIsCheckingNatalChart(false);
        }
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, []);

  useFocusEffect(checkNatalChart);

  return { isCheckingNatalChart, isNatalChartModalVisible };
};
