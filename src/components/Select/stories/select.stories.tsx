import { Select } from "@components";
import type { Meta, StoryObj } from "@storybook/react";
import { Item } from "react-stately";

const meta: Meta<typeof Select> = {
  title: "Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "Uy no mera flojera documentar esto",
      },
    },
  },
  args: {
    label: "Select",
    name: "select",
    placeholder: "Select the correct answer",
  },
  render: (args) => (
    <Select {...args}>
      <Item>I Will see the Buckingham palace.</Item>
      <Item>If you miss the bus?</Item>
      <Item>I Will go to the beach.</Item>
      <Item>If you go to France.</Item>
    </Select>
  ),
};
