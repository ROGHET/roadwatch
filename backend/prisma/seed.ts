import { PrismaClient, Role, ComplaintStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const citizen1 = await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {},
    create: {
      email: 'citizen@example.com',
      name: 'Rahul Sharma',
      password: passwordHash,
      role: Role.CITIZEN
    }
  });

  const citizen2 = await prisma.user.upsert({
    where: { email: 'citizen2@example.com' },
    update: {},
    create: {
      email: 'citizen2@example.com',
      name: 'Priya Patel',
      password: passwordHash,
      role: Role.CITIZEN
    }
  });

  const authorityUser1 = await prisma.user.upsert({
    where: { email: 'nhai@example.com' },
    update: {},
    create: {
      email: 'nhai@example.com',
      name: 'NHAI Admin',
      password: passwordHash,
      role: Role.AUTHORITY
    }
  });

  const authorityUser2 = await prisma.user.upsert({
    where: { email: 'pwd@example.com' },
    update: {},
    create: {
      email: 'pwd@example.com',
      name: 'PWD Admin',
      password: passwordHash,
      role: Role.AUTHORITY
    }
  });

  console.log('Created Users.');

  // 2. Create Authorities
  const nhai = await prisma.authority.create({
    data: {
      name: 'NHAI Mumbai',
      type: 'NHAI',
      contactEmail: 'nhai.mumbai@example.com'
    }
  });

  const pwd = await prisma.authority.create({
    data: {
      name: 'PWD Maharashtra',
      type: 'PWD',
      contactEmail: 'pwd.mh@example.com'
    }
  });

  const nmmc = await prisma.authority.create({
    data: {
      name: 'Navi Mumbai Municipal Corporation',
      type: 'MUNICIPAL',
      contactEmail: 'info@nmmc.gov.in'
    }
  });

  console.log('Created Authorities.');

  // 3. Create Roads (at least 10)
  const roadsData = [
    { name: 'Mumbai-Pune Expressway', type: 'Highway', authId: nhai.id, startLat: 18.9401, startLng: 73.0233, endLat: 18.7302, endLng: 73.3456, budgetSanctioned: 450.5, budgetSpent: 410.2, contractor: 'L&T Construction' },
    { name: 'Sion-Panvel Expressway', type: 'Highway', authId: pwd.id, startLat: 19.0433, startLng: 72.8621, endLat: 19.0264, endLng: 73.0645, budgetSanctioned: 120.0, budgetSpent: 85.5, contractor: 'Reliance Infra' },
    { name: 'Eastern Express Highway', type: 'Arterial', authId: pwd.id, startLat: 19.0176, startLng: 72.8562, endLat: 19.2345, endLng: 72.9732, budgetSanctioned: 340.0, budgetSpent: 300.0, contractor: 'GMR Group' },
    { name: 'Western Express Highway', type: 'Arterial', authId: nhai.id, startLat: 19.0522, startLng: 72.8341, endLat: 19.2934, endLng: 72.8576, budgetSanctioned: 500.0, budgetSpent: 480.0, contractor: 'IRB Infrastructure' },
    { name: 'Palm Beach Road', type: 'Local', authId: nmmc.id, startLat: 19.0622, startLng: 73.0034, endLat: 19.0145, endLng: 73.0211, budgetSanctioned: 45.0, budgetSpent: 32.5, contractor: 'JMC Projects' },
    { name: 'Thane-Belapur Road', type: 'Arterial', authId: pwd.id, startLat: 19.2013, startLng: 72.9789, endLat: 19.0765, endLng: 73.0112, budgetSanctioned: 85.0, budgetSpent: 60.2, contractor: 'HCC Ltd' },
    { name: 'JNPT Road', type: 'Highway', authId: nhai.id, startLat: 18.9412, startLng: 72.9523, endLat: 18.8923, endLng: 73.0045, budgetSanctioned: 220.0, budgetSpent: 195.0, contractor: 'Afcons' },
    { name: 'Vashi Bridge', type: 'Bridge', authId: pwd.id, startLat: 19.0654, startLng: 72.9987, endLat: 19.0567, endLng: 72.9723, budgetSanctioned: 95.0, budgetSpent: 90.0, contractor: 'L&T Construction' },
    { name: 'Koparkhairane Main Road', type: 'Local', authId: nmmc.id, startLat: 19.1023, startLng: 73.0112, endLat: 19.1156, endLng: 73.0234, budgetSanctioned: 15.0, budgetSpent: 8.5, contractor: 'Local Paving Co' },
    { name: 'Nerul Spine Road', type: 'Local', authId: nmmc.id, startLat: 19.0345, startLng: 73.0156, endLat: 19.0489, endLng: 73.0234, budgetSanctioned: 20.0, budgetSpent: 19.5, contractor: 'Navi Mumbai Infra' }
  ];

  const roads = [];
  for (const r of roadsData) {
    const road = await prisma.road.create({
      data: {
        name: r.name,
        type: r.type,
        authorityId: r.authId,
        startLat: r.startLat,
        startLng: r.startLng,
        endLat: r.endLat,
        endLng: r.endLng,
        budgetSanctioned: r.budgetSanctioned,
        budgetSpent: r.budgetSpent,
        contractor: r.contractor,
        geometry: {} // mock empty geometry
      }
    });
    roads.push(road);
  }

  console.log(`Created ${roads.length} Roads.`);

  // 4. Create Complaints (at least 15)
  const complaintData = [
    { userId: citizen1.id, roadId: roads[0].id, authId: nhai.id, issueType: 'Pothole', severity: 'HIGH', status: ComplaintStatus.ROUTED, lat: 18.8500, lng: 73.1500, desc: 'Deep pothole on fast lane' },
    { userId: citizen2.id, roadId: roads[0].id, authId: nhai.id, issueType: 'Accident', severity: 'CRITICAL', status: ComplaintStatus.IN_PROGRESS, lat: 18.8800, lng: 73.1200, desc: 'Major collision blocking 2 lanes' },
    { userId: citizen1.id, roadId: roads[1].id, authId: pwd.id, issueType: 'Streetlight', severity: 'LOW', status: ComplaintStatus.RESOLVED, lat: 19.0300, lng: 72.9500, desc: 'Streetlights not working' },
    { userId: citizen2.id, roadId: roads[2].id, authId: pwd.id, issueType: 'Waterlogging', severity: 'MEDIUM', status: ComplaintStatus.PENDING, lat: 19.1500, lng: 72.9000, desc: 'Water accumulated near junction' },
    { userId: citizen1.id, roadId: roads[3].id, authId: nhai.id, issueType: 'Traffic Jam', severity: 'LOW', status: ComplaintStatus.RESOLVED, lat: 19.2000, lng: 72.8450, desc: 'Heavy traffic congestion' },
    { userId: citizen2.id, roadId: roads[4].id, authId: nmmc.id, issueType: 'Pothole', severity: 'MEDIUM', status: ComplaintStatus.ROUTED, lat: 19.0500, lng: 73.0100, desc: 'Multiple small potholes' },
    { userId: citizen1.id, roadId: roads[5].id, authId: pwd.id, issueType: 'Debris', severity: 'HIGH', status: ComplaintStatus.IN_PROGRESS, lat: 19.1200, lng: 72.9900, desc: 'Construction debris on road' },
    { userId: citizen2.id, roadId: roads[6].id, authId: nhai.id, issueType: 'Accident', severity: 'CRITICAL', status: ComplaintStatus.PENDING, lat: 18.9200, lng: 72.9800, desc: 'Truck overturned' },
    { userId: citizen1.id, roadId: roads[7].id, authId: pwd.id, issueType: 'Cracks', severity: 'MEDIUM', status: ComplaintStatus.ROUTED, lat: 19.0600, lng: 72.9800, desc: 'Bridge expansion joint damaged' },
    { userId: citizen2.id, roadId: roads[8].id, authId: nmmc.id, issueType: 'Waterlogging', severity: 'MEDIUM', status: ComplaintStatus.RESOLVED, lat: 19.1050, lng: 73.0150, desc: 'Drain clogged' },
    { userId: citizen1.id, roadId: roads[9].id, authId: nmmc.id, issueType: 'Signage', severity: 'LOW', status: ComplaintStatus.REJECTED, lat: 19.0400, lng: 73.0200, desc: 'Speed limit sign missing' },
    { userId: citizen2.id, roadId: roads[2].id, authId: pwd.id, issueType: 'Pothole', severity: 'HIGH', status: ComplaintStatus.IN_PROGRESS, lat: 19.1600, lng: 72.9200, desc: 'Massive crater after rain' },
    { userId: citizen1.id, roadId: roads[3].id, authId: nhai.id, issueType: 'Debris', severity: 'MEDIUM', status: ComplaintStatus.ROUTED, lat: 19.2500, lng: 72.8500, desc: 'Fallen tree branches' },
    { userId: citizen2.id, roadId: roads[4].id, authId: nmmc.id, issueType: 'Streetlight', severity: 'LOW', status: ComplaintStatus.PENDING, lat: 19.0550, lng: 73.0150, desc: 'Entire stretch is dark' },
    { userId: citizen1.id, roadId: roads[5].id, authId: pwd.id, issueType: 'Signage', severity: 'LOW', status: ComplaintStatus.RESOLVED, lat: 19.1500, lng: 72.9900, desc: 'Faded lane markings' }
  ];

  let complaintsCreated = 0;
  for (const c of complaintData) {
    await prisma.complaint.create({
      data: {
        userId: c.userId,
        roadId: c.roadId,
        authorityId: c.authId,
        issueType: c.issueType,
        severity: c.severity,
        status: c.status,
        latitude: c.lat,
        longitude: c.lng,
        description: c.desc
      }
    });
    complaintsCreated++;
  }

  console.log(`Created ${complaintsCreated} Complaints.`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
