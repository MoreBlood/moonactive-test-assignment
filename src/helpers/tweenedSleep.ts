import gsap from "gsap";

export default function sleep(s: number): Promise<void> {
  return new Promise((resolve) => gsap.delayedCall(s, resolve));
}
