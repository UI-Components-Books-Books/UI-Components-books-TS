import type { StoryObj, Meta } from "@storybook/react";

import { Interpreter } from "../src/interpreter";

const meta: Meta<typeof Interpreter> = {
  title: "Interpreter",
  component: Interpreter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "No lo he terminado asi que no moleste 🤬",
      },
    },
  },
  render: () => <Interpreter />,
};
