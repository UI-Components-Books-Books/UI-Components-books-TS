import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../../Button";
import { Modal } from "../src/modal";

const meta: Meta<typeof Modal> = {
  title: "Modal",
  component: Modal,
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
        story:
          "El componente `Modal` está equipado con diversas propiedades que permiten su completa personalización. Además, este implementa el atributo `inert` en el DOM, que previene que el foco salga del componente. Para su implementación, solo necesitas importar el componente `<Modal/>`. Este incluye los componentes `<Modal.CloseButton/>`, `<Modal.Overlay/>` y `<Modal.Content/>`, necesarios para su uso.  Haz clic en `Show code` en la parte inferior para ver y utilizar este ejemplo.",
      },
    },
  },
  args: {
    isOpen: false,
    onClose: () => null,
    finalFocusRef: ".js-button",
    children: (
      <>
        <Modal.Overlay />
        <Modal.Content>
          <p style={{ margin: "3rem" }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque earum
            illo quibusdam commodi saepe sunt ad, rerum voluptate recusandae,
            ipsum illum maiores sequi libero labore architecto voluptates cumque
            consequatur nam! Nam amet maiores vitae perferendis natus. Optio,
            quisquam. Alias perspiciatis nostrum quo aliquam non rerum odit
            molestiae officia, et obcaecati repudiandae, quia laborum eius ipsam
            eveniet consequuntur corrupti facere eos? Officiis consectetur
            tempore voluptatem architecto qui? Laudantium, voluptas quae
            reiciendis rerum minima repudiandae voluptatum dignissimos suscipit
            voluptate ex assumenda possimus quaerat incidunt tempore enim natus
            accusantium sit nostrum optio. Delectus! Sapiente maiores ea eum
            quaerat tempora unde eveniet assumenda blanditiis, ad quia ex ipsam
            repellendus totam explicabo, nemo magnam vero. Pariatur cupiditate
            earum, necessitatibus rem fugiat similique error voluptates
            officiis? Rerum enim, unde minima cumque, tempore quam
            necessitatibus sunt culpa molestias officiis doloremque. Eaque,
            aliquam porro, inventore debitis sapiente ipsum nesciunt eum impedit
            perferendis ipsam minima ullam, quis recusandae sed? Id voluptatem
            tempore fugit in ipsa vel? Debitis culpa facere eum, reprehenderit
            labore temporibus eius ducimus corporis, in similique fugiat ipsum
            est beatae sapiente id ad iste quaerat dolores? Molestias. Maiores,
            ullam illum, optio soluta corporis dignissimos alias, similique quos
            dolores eum animi sint! Quod recusandae ipsam suscipit placeat
            quaerat rem accusamus labore perferendis facere consequuntur! Rerum
            nihil suscipit ipsum. Blanditiis corporis officiis possimus pariatur
            commodi, eveniet quasi magni quam illum ad, eius deleniti iusto
            quas, voluptate architecto provident iure excepturi ex at error
            quisquam eligendi unde mollitia! Aliquam, commodi? Sit ut maxime
            facere a nihil rem obcaecati distinctio. Voluptate ratione quibusdam
            possimus corrupti in illo quae explicabo alias dicta. Nemo
            laboriosam molestiae explicabo animi a pariatur, unde enim magnam?
            Iste minima nulla similique exercitationem voluptas. Unde
            consectetur enim distinctio veritatis doloremque odio, repellat qui
            cupiditate soluta hic assumenda ipsa debitis explicabo sed sequi
            nobis deserunt non minus eaque illum.
          </p>
          <Modal.CloseButton />
        </Modal.Content>
      </>
    ),
  },
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => {
      setIsOpen(!isOpen);
    };

    return (
      <>
        <Button addClass="js-button" onClick={toggleModal}>
          Open modal
        </Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={toggleModal}
          finalFocusRef=".js-button"
        />
      </>
    );
  },
};

export const FinalFocusModal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con la propiedad `finalFocusRef` podemos indicar cuál elemento se va a enfocar luego de cerrar el modal. Es importante que esta propiedad siempre esté presente por temas de accesibilidad. Para su implementación, lo único que debes hacer es pasarle un `selector CSS`, el cual debe estar presente en el elemento que quieres que se enfoque.",
      },
    },
  },
  args: {
    ...Default.args,
  },
  render: function Render(args) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => {
      setIsOpen(!isOpen);
    };

    return (
      <>
        <Button addClass="js-button" onClick={toggleModal}>
          Open modal
        </Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={toggleModal}
          finalFocusRef=".js-button"
        />
      </>
    );
  },
};
