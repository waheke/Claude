import { useEffect } from 'react';
import type { RefObject } from 'react';

interface SafariGestureEvent extends Event {
  scale: number;
}

interface UsePinchZoomOptions {
  /** Add a fixed amount to the zoom level (used for trackpad ctrl+wheel zoom). */
  onZoomBy: (delta: number) => void;
  /** Multiply the zoom level by a factor (used for touch pinch and Safari gestures). */
  onZoomScale: (factor: number) => void;
}

function distanceBetween(touches: TouchList): number {
  const [a, b] = [touches[0], touches[1]];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/**
 * Lets the user zoom the board with a pinch gesture (touchscreen), a
 * trackpad pinch (reported by browsers as wheel events with ctrlKey), or
 * Safari's proprietary gesture events, scoped to the given element.
 */
export function usePinchZoom(ref: RefObject<HTMLElement | null>, { onZoomBy, onZoomScale }: UsePinchZoomOptions) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let lastTouchDistance: number | null = null;
    let lastGestureScale = 1;

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey) return;
      event.preventDefault();
      onZoomBy(-event.deltaY * 0.01);
    }

    function handleTouchStart(event: TouchEvent) {
      if (event.touches.length === 2) {
        lastTouchDistance = distanceBetween(event.touches);
      }
    }

    function handleTouchMove(event: TouchEvent) {
      if (event.touches.length !== 2 || lastTouchDistance === null) return;
      event.preventDefault();
      const newDistance = distanceBetween(event.touches);
      onZoomScale(newDistance / lastTouchDistance);
      lastTouchDistance = newDistance;
    }

    function handleTouchEnd(event: TouchEvent) {
      if (event.touches.length < 2) lastTouchDistance = null;
    }

    function handleGestureStart(event: Event) {
      event.preventDefault();
      lastGestureScale = 1;
    }

    function handleGestureChange(event: Event) {
      event.preventDefault();
      const scale = (event as SafariGestureEvent).scale;
      onZoomScale(scale / lastGestureScale);
      lastGestureScale = scale;
    }

    function handleGestureEnd(event: Event) {
      event.preventDefault();
      lastGestureScale = 1;
    }

    node.addEventListener('wheel', handleWheel, { passive: false });
    node.addEventListener('touchstart', handleTouchStart, { passive: false });
    node.addEventListener('touchmove', handleTouchMove, { passive: false });
    node.addEventListener('touchend', handleTouchEnd);
    // Non-standard, Safari-only events for trackpad pinch (Safari doesn't
    // emit ctrl+wheel for pinch the way Chrome/Firefox do).
    node.addEventListener('gesturestart', handleGestureStart as EventListener, { passive: false });
    node.addEventListener('gesturechange', handleGestureChange as EventListener, { passive: false });
    node.addEventListener('gestureend', handleGestureEnd as EventListener, { passive: false });

    return () => {
      node.removeEventListener('wheel', handleWheel);
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchend', handleTouchEnd);
      node.removeEventListener('gesturestart', handleGestureStart as EventListener);
      node.removeEventListener('gesturechange', handleGestureChange as EventListener);
      node.removeEventListener('gestureend', handleGestureEnd as EventListener);
    };
  }, [ref, onZoomBy, onZoomScale]);
}
