import { sharedGreeting } from "@fixture/shared";

export function consumerGreeting(name: string): string {
  return sharedGreeting(name);
}
