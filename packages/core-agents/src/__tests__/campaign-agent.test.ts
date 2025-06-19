import { CampaignAgent } from '../campaign-agent';

describe('CampaignAgent', () => {
  let campaignAgent: CampaignAgent;

  beforeEach(() => {
    campaignAgent = new CampaignAgent();
  });

  it('should schedule campaign successfully', async () => {
    const result = await campaignAgent.scheduleCampaign({ id: '1', name: 'Test', platforms: ['twitter'] });
    expect(result.success).toBe(true);
  });
});
