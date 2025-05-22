import Joyride, { CallBackProps, Step } from 'react-joyride';
import { useEffect, useState } from 'react';

interface WorkspaceTutorialProps {
  run: boolean;
  onFinish?: () => void;
}

export default function WorkspaceTutorial({ run, onFinish }: WorkspaceTutorialProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const steps: Step[] = [
    {
      target: '.tutorial-search',
      content: "You can press '/' to begin searching instantly",
      disableBeacon: true,
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const finished = data.status === 'finished' || data.status === 'skipped';
    if (finished && onFinish) {
      onFinish(); // reset run flag from parent
    }
  };

  if (!isMounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      showProgress
      showSkipButton
      spotlightPadding={0}
      disableScrolling
      continuous
      styles={{
        options: { zIndex: 9999 },
        tooltip: {
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
        },
        buttonNext: {
          backgroundColor: '#DBEAFE',
          color: '#336CCD',
        },
      }}
      floaterProps={{
        styles: {
          arrow: { color: '#DBEAFE' },
        },
      }}
      callback={handleCallback}
    />
  );
}
