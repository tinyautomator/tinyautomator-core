import Joyride, { CallBackProps, Step } from 'react-joyride';
import { useEffect, useState } from 'react';

interface WorkspaceTutorialProps {
  run: boolean;
  onFinish?: () => void;
  onToggleCategory: (category: string) => void;
  categorySteps: Record<number, string>;
}

export default function WorkspaceTutorial({
  run,
  onFinish,
  onToggleCategory,
  categorySteps,
}: WorkspaceTutorialProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const steps: Step[] = [
    {
      target: '.tutorial-search',
      content: "You can press '/' to begin a block search.",
      disableBeacon: true,
    },
    {
      target: '.scroll-area',
      content: (
        <div>
          <p>Blocks come in two types:</p>
          <p>Triggers & Actions</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '.scroll-area',
      content: (
        <div>
          <p>Triggers are the starting point of a workflow.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '.scroll-area',
      content: (
        <div>
          <p>Actions are the actions that are performed by the workflow.</p>
        </div>
      ),
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status, index, type } = data;

    const prevIndex = index - 1;
    if (type === 'step:after') {
      if (prevIndex in categorySteps) {
        const prevCategory = categorySteps[prevIndex];
        onToggleCategory(prevCategory); // toggles closed
      }

      if (index in categorySteps) {
        const categoryName = categorySteps[index];
        onToggleCategory(categoryName); // toggles open
      }
    }

    const finished = status === 'finished' || status === 'skipped';
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
