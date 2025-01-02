import express, { Request, Response } from 'express';
import { Logger, Agent, ContractAgent, MongoDBProvider } from '../../index';
import { ObjectId } from 'mongodb';

const app = express();
const port = 3000;

app.use(express.json());

async function startServer() {
  try {
    Logger.info('Initializing ContractAgent...');
    // eslint-disable-next-line no-undef
    Agent.setConfigPath('../mocks/contract-agent.config.json', __filename);

    const originalProto = ContractAgent.prototype as any;
    const originalHandleDataInserted = originalProto.handleDataInserted;
    const originalHandleDataUpdated = originalProto.handleDataUpdated;
    const originalHandleDataDeleted = originalProto.handleDataDeleted;

    (ContractAgent.prototype as any).handleDataInserted = async function (
      data: any,
    ) {
      Logger.info(`Data inserted: ${JSON.stringify(data, null, 2)}`);
      return await originalHandleDataInserted.call(this, data);
    };

    (ContractAgent.prototype as any).handleDataUpdated = async function (
      data: any,
    ) {
      Logger.info(`Data updated: ${JSON.stringify(data, null, 2)}`);
      return await originalHandleDataUpdated.call(this, data);
    };

    (ContractAgent.prototype as any).handleDataDeleted = async function (
      data: any,
    ) {
      Logger.info(`Data deleted: ${JSON.stringify(data, null, 2)}`);
      return await originalHandleDataDeleted.call(this, data);
    };

    const contractAgent = await ContractAgent.retrieveService();

    if (!contractAgent) {
      throw new Error('Failed to initialize ContractAgent.');
    }

    const provider = contractAgent.getDataProvider(
      'contracts',
    ) as MongoDBProvider;

    const client = provider.getClient();
    if (!client) {
      throw new Error('MongoDB client not initialized');
    }
    const collection = provider.getCollection();

    Logger.info('ContractAgent initialized successfully.');

    app.post('/insert', async (req: Request, res: Response) => {
      try {
        const document = req.body;
        const result = await collection.insertOne(document);
        res.json({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    });

    app.put('/update/:id', async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const update = req.body;
        const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: update },
        );
        res.json({ success: true, modifiedCount: result.modifiedCount });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    });

    app.delete('/delete/:id', async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        res.json({ success: true, deletedCount: result.deletedCount });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: (error as Error).message,
        });
      }
    });

    app.listen(port, () => {
      Logger.info(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    Logger.error(`Failed to start the server: ${(error as Error).message}`);
    process.exit(1);
  }
}

void startServer();
