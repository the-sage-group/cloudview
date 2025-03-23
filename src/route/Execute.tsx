import {
  Modal,
  Stack,
  Text,
  Combobox,
  InputBase,
  ScrollArea,
  Group,
  Button,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBrandGithub,
  IconUser,
  IconSearch,
  IconPlayerPlayFilled,
  IconRoute,
} from "@tabler/icons-react";
import {
  EntityType,
  Entity,
  FieldDescriptorProto,
} from "@the-sage-group/awyes-web";
import { useNavigate } from "react-router";
import { useState } from "react";

import { useAwyes, useGitHub } from "../Context";
import { Identifier, IdentifierType } from "../molecules/Identifier";

export function Execute() {
  const navigate = useNavigate();
  const { awyes, selectedFlow, selectedTrip } = useAwyes();
  const { repositories } = useGitHub();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [modalOpened, modal] = useDisclosure(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  if (!selectedFlow || selectedTrip) return null;

  return (
    <>
      <Button
        size="xl"
        radius="xl"
        color="var(--mantine-color-blue-filled)"
        variant="filled"
        disabled={selectedFlow.nodes.length === 0}
        style={{
          width: "64px",
          height: "64px",
          padding: 0,
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          zIndex: 5,
        }}
        onClick={modal.open}
      >
        <IconPlayerPlayFilled size={24} />
      </Button>

      <Modal
        opened={modalOpened}
        onClose={modal.close}
        title={
          <Group>
            <IconRoute size={24} />
            <Identifier
              type={IdentifierType.ROUTE}
              data={{ context: selectedFlow.context, name: selectedFlow.name }}
            />
          </Group>
        }
        size="xl"
      >
        <Stack gap="md">
          <Stack gap="xs">
            <Text fw={500}>Select Entity</Text>
            <Combobox
              store={combobox}
              onOptionSubmit={(val) => {
                setSelectedEntity({ name: val, type: EntityType.REPOSITORY });
                setSearchValue(val);
                combobox.closeDropdown();
              }}
            >
              <Combobox.Target>
                <InputBase
                  value={searchValue}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setSearchValue(value);
                    setSelectedEntity({
                      name: value,
                      type: EntityType.USER,
                    });
                  }}
                  onClick={() => {
                    const hasMatches = repositories.some((repo) =>
                      repo.full_name
                        .toLowerCase()
                        .includes(searchValue.toLowerCase().trim())
                    );
                    if (hasMatches) {
                      combobox.openDropdown();
                    }
                  }}
                  leftSection={
                    selectedEntity &&
                    (selectedEntity.type === EntityType.REPOSITORY ? (
                      <IconBrandGithub
                        size={16}
                        style={{ color: "var(--mantine-color-blue-filled)" }}
                      />
                    ) : (
                      <IconUser
                        size={16}
                        style={{ color: "var(--mantine-color-gray-6)" }}
                      />
                    ))
                  }
                  rightSection={<IconSearch size={16} />}
                  rightSectionPointerEvents="none"
                  placeholder="Search repositories or enter custom entity..."
                />
              </Combobox.Target>

              {repositories.some((repo) =>
                repo.full_name
                  .toLowerCase()
                  .includes(searchValue.toLowerCase().trim())
              ) && (
                <Combobox.Dropdown>
                  <Combobox.Options>
                    <ScrollArea.Autosize mah={400} type="scroll">
                      {repositories
                        .filter((repo) =>
                          repo.full_name
                            .toLowerCase()
                            .includes(searchValue.toLowerCase().trim())
                        )
                        .map((repo) => (
                          <Combobox.Option
                            value={repo.full_name}
                            key={repo.node_id}
                          >
                            <Group>
                              <IconBrandGithub size={20} />
                              <div>
                                <Text fw={500}>{repo.full_name}</Text>
                                <Text size="xs" c="dimmed">
                                  {repo.description || "No description"}
                                </Text>
                              </div>
                            </Group>
                          </Combobox.Option>
                        ))}
                    </ScrollArea.Autosize>
                  </Combobox.Options>
                </Combobox.Dropdown>
              )}
            </Combobox>
          </Stack>

          {selectedFlow.parameter.length > 0 && (
            <Stack gap="xs">
              <Text fw={500}>Parameters</Text>
              {selectedFlow.parameter.map(
                (param: FieldDescriptorProto, index) => (
                  <div key={index}>
                    <Group mb="xs">
                      <Identifier
                        type={IdentifierType.FIELD}
                        data={{
                          name: param.name,
                          type: param.type,
                        }}
                      />
                    </Group>
                    <TextInput
                      placeholder={`Enter ${param.name}`}
                      value={paramValues[param.name!] || ""}
                      onChange={(e) =>
                        setParamValues({
                          ...paramValues,
                          [param.name!]: e.currentTarget.value,
                        })
                      }
                      required
                    />
                  </div>
                )
              )}
            </Stack>
          )}

          <Group justify="flex-end" mt="xl">
            <Button variant="light" onClick={modal.close}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedEntity) return;
                try {
                  const stateValues: Record<string, Uint8Array> = {};
                  Object.entries(paramValues).forEach(([key, value]) => {
                    stateValues[key] = new TextEncoder().encode(value);
                  });

                  console.log("selectedFlow", selectedFlow);
                  const positions = selectedFlow.nodes.map((node) => node.data);
                  const { response } = await awyes.startTrip({
                    route: {
                      ...selectedFlow,
                      name: `${selectedFlow.context}.${selectedFlow.name}`,
                      position: positions,
                    },
                    start: positions.find((p) => p.handler === "infra.start"),
                    state: stateValues,
                    entity: selectedEntity,
                  });
                  navigate(`/trip/${response.trip?.id}`);
                } catch (error) {
                  console.error("Failed to execute flow:", error);
                }
              }}
              disabled={
                !selectedEntity ||
                Object.keys(paramValues).length < selectedFlow.parameter.length
              }
            >
              Execute
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
