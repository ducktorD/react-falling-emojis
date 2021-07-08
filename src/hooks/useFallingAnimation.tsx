import { useState, useRef, useMemo, useEffect } from 'react';
import gsap from 'gsap';

import FallingAnimationProps from '../interfaces/FallingAnimationProps'; // eslint-disable-line

/**
 * Make an element falling from top to bottom and it can be varied by props
 */
const useFallingAnimation = ({
  id,
  reverse,
  size,
  speed,
  repeat
}: FallingAnimationProps) => {
  const [repeatCounter, setRepeatCounter] = useState<number>(0);
  const reverseRef = useRef(reverse);
  const sizeRef = useRef(size);
  const speedRef = useRef(speed);

  const timeline = useMemo(
    () =>
      gsap.timeline({
        repeatRefresh: true
      }),
    []
  );

  /**
   * This recursive function behaves like the timeline would be repeated, but
   * also sensitive for window resizing and other changes...
   */
  const initFallingAnimation = () => {
    const getRandomX = gsap.utils.random(0, window.innerWidth, true);
    const top = -(sizeRef.current * 2);
    const bottom = window.innerHeight + sizeRef.current * 2;

    timeline
      .fromTo(
        id,
        {
          y: reverseRef.current ? bottom : top,
          x: getRandomX,
          repeatRefresh: true
        },
        {
          y: reverseRef.current ? top : bottom,
          x: getRandomX,
          repeatRefresh: true,
          delay: gsap.utils.random(0, speedRef.current, true),
          duration: speedRef.current,
          ease: 'none',
          onStart: () => {
            // timeline.clear();
            initFallingAnimation();
          },
          onComplete: () => {
            timeline.clear();
            setRepeatCounter((currentValue) =>
              currentValue !== 1 ? currentValue + 1 : 0
            );
            initFallingAnimation();
          }
        }
      )
      .play();
  };

  useEffect(() => {
    initFallingAnimation();
    return () => {
      timeline.clear(); // clean-up
    };
  }, []);

  /**
   * Update references on change
   */
  useEffect(() => {
    reverseRef.current = reverse;
    // restart the animation with new reverse param...
    timeline.clear();
    initFallingAnimation();
  }, [reverse]);

  useEffect(() => {
    speedRef.current = speed;
    timeline.clear();
    initFallingAnimation();
  }, [speed]);

  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  useEffect(() => {
    if (repeat !== -1 && repeat === repeatCounter) {
      timeline.clear();
    }
  }, [repeatCounter, repeat]);

  return timeline;
};

export default useFallingAnimation;
