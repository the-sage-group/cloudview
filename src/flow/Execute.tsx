import {
  Modal,
  Title,
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
  IconPlayerPlay,
} from "@tabler/icons-react";
import {
  EntityType,
  Entity,
  FieldDescriptorProto,
  Value,
} from "@the-sage-group/awyes-web";
import { useNavigate } from "react-router";
import { useState } from "react";

import { useAwyes, useGitHub } from "../Context";

export function Execute() {
  const navigate = useNavigate();
  const { awyes, selectedFlow } = useAwyes();
  const { repositories } = useGitHub();
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [modalOpened, modal] = useDisclosure(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  if (!selectedFlow) return null;

  return (
    <>
      <Button
        size="xl"
        radius="xl"
        color="blue"
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
        title={
          selectedFlow.nodes.length === 0
            ? "Add nodes to execute flow"
            : "Execute flow"
        }
      >
        <IconPlayerPlay size={24} />
      </Button>

      <Modal
        opened={modalOpened}
        onClose={modal.close}
        title={<Title order={3}>Execute Flow</Title>}
        size="lg"
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
                  <TextInput
                    key={index}
                    label={param.name}
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
                  const stateValues: { [key: string]: Value } = {};
                  Object.entries(paramValues).forEach(([key, value]) => {
                    stateValues[key] = Value.fromJson({ stringValue: value });
                  });

                  const { response } = await awyes.startTrip({
                    route: {
                      ...selectedFlow,
                      position: selectedFlow.nodes.map((node) => node.data),
                    },
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
