import { Interpreter } from "@components";
import type { StoryObj, Meta } from "@storybook/react-vite";

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
        story: "No lo he terminado asi que no moleste 🤬 (ya casi)",
      },
    },
  },
  render: () => <Interpreter />,
};
