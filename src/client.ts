import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import {
  AwyesClient,
  Node,
  Flow,
  ListNodesResponse,
  ExecuteFlowResponse,
  RegisterFlowResponse,
  RegisterNodeResponse,
  ListFlowsResponse,
} from "@the-sage-group/awyes-web";

export class AwyesService {
  private readonly client: AwyesClient;

  constructor() {
    const transport = new GrpcWebFetchTransport({
      baseUrl: "http://localhost:8080",
      allowInsecure: true,
    });
    this.client = new AwyesClient(transport);
  }

  async registerFlow(flow: Flow): Promise<RegisterFlowResponse> {
    const request = { flow };
    const { response } = await this.client.registerFlow(request);
    return response;
  }

  async registerNode(node: Node): Promise<RegisterNodeResponse> {
    const request = { node };
    const { response } = await this.client.registerNode(request);
    return response;
  }

  async listNodes(): Promise<ListNodesResponse> {
    const request = {};
    const { response } = await this.client.listNodes(request);
    return response;
  }

  async listFlows(): Promise<ListFlowsResponse> {
    const request = {};
    const { response } = await this.client.listFlows(request);
    return response;
  }

  async executeFlow(flow: Flow): Promise<ExecuteFlowResponse> {
    const request = { flow };
    const { response } = await this.client.executeFlow(request);
    return response;
  }
}
