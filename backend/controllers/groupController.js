import Group from '../models/Group.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

export const createGroup = async (req, res) => {
  try {
    const { groupName } = req.body;
    if (!groupName) return res.status(400).json({ message: 'Group name required' });

    const group = await Group.create({
      groupName,
      members: [req.user.id],
      createdBy: req.user.id,
      inviteCode: uuidv4().substring(0, 8).toUpperCase(),
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const group = await Group.findOne({ inviteCode });
    
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.members.includes(req.user.id)) return res.status(400).json({ message: 'Already a member' });

    group.members.push(req.user.id);
    await group.save();

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findOne({ members: req.user.id }).lean();
    
    // Return null (not 404) when user has no group — this is not an error state
    if (!group) return res.json(null);
    
    // Fetch member details to enrich the response
    const users = await User.find({ userId: { $in: group.members } });
    group.memberDetails = users.map(u => ({ userId: u.userId, name: u.name }));
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
