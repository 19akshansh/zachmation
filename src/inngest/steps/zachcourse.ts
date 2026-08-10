import type { GetStepTools, Inngest } from "inngest";

type BaseStepTools = GetStepTools<Inngest.Any>;

export type ZachCourseStepTools = BaseStepTools & {
  zachcourse: <T>(id: string, handler: () => Promise<T> | T) => Promise<T>;
};

export const withZachCourseStep = (
  step: BaseStepTools,
): ZachCourseStepTools => {
  return new Proxy(step, {
    get(target, property, receiver) {
      if (property === "zachcourse") {
        return <T>(id: string, handler: () => Promise<T> | T) =>
          target.run(id, handler);
      }

      return Reflect.get(target, property, receiver);
    },
  }) as ZachCourseStepTools;
};
