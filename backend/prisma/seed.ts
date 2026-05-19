import { PrismaClient, UserRole, SessionStatus, CowStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const nigerianStates: Record<string, string[]> = {
  'Abia': ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma Ngwa', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
  'Adamawa': ['Demsa', 'Fufore', 'Ganye', 'Girei', 'Gombi', 'Guyuk', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  'Akwa Ibom': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung Uko', 'Ukanafun', 'Uruan', 'Urue Offong/Oruko', 'Uyo'],
  'Anambra': ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
  'Bauchi': ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
  'Bayelsa': ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
  'Benue': ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Oturkpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  'Borno': ['Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
  'Cross River': ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakurr', 'Yala'],
  'Delta': ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'],
  'Ebonyi': ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
  'Edo': ['Akoko Edo', 'Egor', 'Esan Central', 'Esan North East', 'Esan South East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Orhionmwon', 'Oredo', 'Ovia North East', 'Ovia South West', 'Owan East', 'Owan West', 'Uhunmwonde'],
  'Ekiti': ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'],
  'Enugu': ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'],
  'Gombe': ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'],
  'Imo': ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema', 'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West', 'Unuimo'],
  'Jigawa': ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'],
  'Kaduna': ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
  'Kano': ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  'Katsina': ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
  'Kebbi': ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'],
  'Kogi': ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
  'Kwara': ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'],
  'Lagos': ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
  'Nasarawa': ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
  'Niger': ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Munya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
  'Ogun': ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Sagamu'],
  'Ondo': ['Akoko North East', 'Akoko North West', 'Akoko South East', 'Akoko South West', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
  'Osun': ['Atakunmosa East', 'Atakunmosa West', 'Aiyedaade', 'Aiyedire', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'],
  'Oyo': ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North East', 'Ibadan North West', 'Ibadan South East', 'Ibadan South West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'],
  'Plateau': ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase'],
  'Rivers': ['Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku Toru', 'Andoni', 'Asari Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  'Sokoto': ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
  'Taraba': ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kurmi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
  'Yobe': ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
  'Zamfara': ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Tsafe', 'Zamfara West'],
  'FCT': ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'],
};

async function main() {
  console.log('🌱 Seeding Deyaanat database...\n');

  // 1. Seed Nigerian States + LGAs
  console.log('📍 Seeding Nigerian states and LGAs...');
  let stateCount = 0;
  let lgaCount = 0;

  for (const [stateName, lgas] of Object.entries(nigerianStates)) {
    const stateCode = stateName === 'FCT' ? 'FC' : stateName.substring(0, 2).toUpperCase();
    const state = await prisma.state.upsert({
      where: { code: stateCode },
      update: {},
      create: { name: stateName, code: stateCode },
    });
    stateCount++;

    for (const lgaName of lgas) {
      await prisma.lga.upsert({
        where: { name_stateId: { name: lgaName, stateId: state.id } },
        update: {},
        create: { name: lgaName, stateId: state.id },
      });
      lgaCount++;
    }
  }
  console.log(`  ✅ ${stateCount} states, ${lgaCount} LGAs seeded\n`);

  // 2. Create Admin Users
  console.log('👤 Creating admin users...');
  const passwordHash = await bcrypt.hash('Deyaanat@2026', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@deyaanat.org' },
    update: { passwordHash, isActive: true },
    create: {
      email: 'superadmin@deyaanat.org',
      fullName: 'Super Administrator',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const centerAdmin1 = await prisma.user.upsert({
    where: { email: 'admin1@deyaanat.org' },
    update: { passwordHash, isActive: true },
    create: {
      email: 'admin1@deyaanat.org',
      fullName: 'Center Admin One',
      passwordHash,
      role: UserRole.CENTER_ADMIN,
      isActive: true,
    },
  });

  const centerAdmin2 = await prisma.user.upsert({
    where: { email: 'admin2@deyaanat.org' },
    update: { passwordHash, isActive: true },
    create: {
      email: 'admin2@deyaanat.org',
      fullName: 'Center Admin Two',
      passwordHash,
      role: UserRole.CENTER_ADMIN,
      isActive: true,
    },
  });
  console.log('  ✅ 3 admin accounts created\n');

  // 3. Create Sample Centers
  console.log('🏢 Creating distribution centers...');
  const abujaCenter = await prisma.center.upsert({
    where: { code: 'ABJ' },
    update: {},
    create: {
      name: 'Abuja Central Distribution Center',
      code: 'ABJ',
      address: 'Plot 123, Embassy District, Abuja',
      phone: '+234 800 000 0001',
      email: 'abj@deyaanat.org',
      isActive: true,
    },
  });

  const lagosCenter = await prisma.center.upsert({
    where: { code: 'LAG' },
    update: {},
    create: {
      name: 'Lagos Western Distribution Center',
      code: 'LAG',
      address: '45 Marina Road, Lagos Island, Lagos',
      phone: '+234 800 000 0002',
      email: 'lagos@deyaanat.org',
      isActive: true,
    },
  });

  const kanoCenter = await prisma.center.upsert({
    where: { code: 'KAN' },
    update: {},
    create: {
      name: 'Kano Northern Distribution Center',
      code: 'KAN',
      address: '78 Emir Palace Road, Kano Municipal, Kano',
      phone: '+234 800 000 0003',
      email: 'kano@deyaanat.org',
      isActive: true,
    },
  });
  console.log('  ✅ 3 centers created\n');

  // 4. Assign states to centers (basic regional mapping)
  console.log('🗺️  Assigning states to centers...');

  const abujaStates = ['FCT', 'Nasarawa', 'Niger', 'Kogi', 'Plateau', 'Benue', 'Kwara'];
  const lagosStates = ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti', 'Edo', 'Delta'];
  const kanoStates = ['Kano', 'Kaduna', 'Katsina', 'Jigawa', 'Zamfara', 'Sokoto', 'Kebbi', 'Bauchi', 'Gombe', 'Borno', 'Yobe', 'Adamawa', 'Taraba'];

  for (const name of abujaStates) {
    const s = await prisma.state.findUnique({ where: { name } });
    if (s) await prisma.centerState.upsert({ where: { centerId_stateId: { centerId: abujaCenter.id, stateId: s.id } }, update: {}, create: { centerId: abujaCenter.id, stateId: s.id } }).catch(() => {});
  }
  for (const name of lagosStates) {
    const s = await prisma.state.findUnique({ where: { name } });
    if (s) await prisma.centerState.upsert({ where: { centerId_stateId: { centerId: lagosCenter.id, stateId: s.id } }, update: {}, create: { centerId: lagosCenter.id, stateId: s.id } }).catch(() => {});
  }
  for (const name of kanoStates) {
    const s = await prisma.state.findUnique({ where: { name } });
    if (s) await prisma.centerState.upsert({ where: { centerId_stateId: { centerId: kanoCenter.id, stateId: s.id } }, update: {}, create: { centerId: kanoCenter.id, stateId: s.id } }).catch(() => {});
  }
  console.log('  ✅ States assigned to centers\n');

  // 5. Assign admins to centers
  console.log('🔗 Assigning admins to centers...');
  await prisma.userCenter.upsert({
    where: { userId_centerId: { userId: superAdmin.id, centerId: abujaCenter.id } },
    update: {}, create: { userId: superAdmin.id, centerId: abujaCenter.id },
  }).catch(() => {});
  await prisma.userCenter.upsert({
    where: { userId_centerId: { userId: superAdmin.id, centerId: lagosCenter.id } },
    update: {}, create: { userId: superAdmin.id, centerId: lagosCenter.id },
  }).catch(() => {});
  await prisma.userCenter.upsert({
    where: { userId_centerId: { userId: superAdmin.id, centerId: kanoCenter.id } },
    update: {}, create: { userId: superAdmin.id, centerId: kanoCenter.id },
  }).catch(() => {});
  await prisma.userCenter.upsert({
    where: { userId_centerId: { userId: centerAdmin1.id, centerId: lagosCenter.id } },
    update: {}, create: { userId: centerAdmin1.id, centerId: lagosCenter.id },
  }).catch(() => {});
  await prisma.userCenter.upsert({
    where: { userId_centerId: { userId: centerAdmin2.id, centerId: kanoCenter.id } },
    update: {}, create: { userId: centerAdmin2.id, centerId: kanoCenter.id },
  }).catch(() => {});
  console.log('  ✅ Admins assigned to centers\n');

  // 6. Create Active Session
  console.log('📅 Creating Qurbani 2026 session...');
  const session = await prisma.session.upsert({
    where: { gregorianYear: 2026 },
    update: {},
    create: {
      gregorianYear: 2026,
      hijriYear: 1448,
      name: 'Qurbani 2026 / 1448 AH',
      registrationOpenDate: new Date('2026-01-01'),
      registrationCloseDate: new Date('2026-08-31'),
      distributionStartDate: new Date('2026-06-10'),
      distributionEndDate: new Date('2026-06-13'),
      status: SessionStatus.REGISTRATION_OPEN,
    },
  });
  console.log(`  ✅ Session created: ${session.name}\n`);

  // 7. Seed SMS Templates
  console.log('💬 Seeding SMS templates...');
  const templates = [
    {
      name: 'registration',
      body: 'Dear {{name}}, your Qurbani registration has been received at Deyaanat. You will be notified upon approval. - Qurbani Board',
    },
    {
      name: 'approval',
      body: 'Dear {{name}}, your Qurbani application has been APPROVED. Code: {{code}}. Collection: Day {{day}} at {{time}}. - Deyaanat Qurbani Board',
    },
    {
      name: 'rejection',
      body: 'Dear {{name}}, your Qurbani application was not approved. Reason: {{reason}}. For inquiries, contact your center. - Deyaanat Qurbani Board',
    },
    {
      name: 'reminder',
      body: 'REMINDER: Your Qurbani meat collection is on Day {{day}} at {{time}}. Code: {{code}}. Please be punctual. - Deyaanat Qurbani Board',
    },
  ];
  for (const tpl of templates) {
    await prisma.smsTemplate.upsert({
      where: { name: tpl.name },
      update: { body: tpl.body },
      create: tpl,
    });
  }
  console.log('  ✅ 4 SMS templates seeded\n');

  // 8. Create Sample Suppliers
  console.log('🐄 Creating sample suppliers...');
  await prisma.supplier.createMany({
    data: [
      { centerId: abujaCenter.id, name: 'Abuja Livestock Co.', phone: '08011110001', address: 'Gwagwalada Cattle Market', notes: 'Trusted supplier since 2022' },
      { centerId: lagosCenter.id, name: 'Lagos Cattle Traders Ltd.', phone: '08022220002', address: 'Agege Abattoir Road', notes: 'Bulk supplier' },
      { centerId: kanoCenter.id, name: 'Kano Livestock Hub', phone: '08033330003', address: 'Dawanau Market', notes: 'Premium quality cattle' },
    ],
    skipDuplicates: true,
  });
  console.log('  ✅ 3 suppliers created\n');

  // 9. Create Sample Cows
  console.log('🐮 Creating sample cows...');
  const abujaSuppliers = await prisma.supplier.findMany({ where: { centerId: abujaCenter.id } });
  const lagosSuppliers = await prisma.supplier.findMany({ where: { centerId: lagosCenter.id } });
  const kanoSuppliers = await prisma.supplier.findMany({ where: { centerId: kanoCenter.id } });

  const cowData = [
    { centerId: abujaCenter.id, supplierId: abujaSuppliers[0]?.id || '', sessionId: session.id, tagNumber: 'COW-ABJ-001', estimatedYield: 200, healthStatus: 'Healthy', purchaseCost: 350000 },
    { centerId: abujaCenter.id, supplierId: abujaSuppliers[0]?.id || '', sessionId: session.id, tagNumber: 'COW-ABJ-002', estimatedYield: 180, healthStatus: 'Healthy', purchaseCost: 320000 },
    { centerId: lagosCenter.id, supplierId: lagosSuppliers[0]?.id || '', sessionId: session.id, tagNumber: 'COW-LAG-001', estimatedYield: 220, healthStatus: 'Healthy', purchaseCost: 380000 },
    { centerId: kanoCenter.id, supplierId: kanoSuppliers[0]?.id || '', sessionId: session.id, tagNumber: 'COW-KAN-001', estimatedYield: 250, healthStatus: 'Excellent', purchaseCost: 400000 },
    { centerId: kanoCenter.id, supplierId: kanoSuppliers[0]?.id || '', sessionId: session.id, tagNumber: 'COW-KAN-002', estimatedYield: 210, healthStatus: 'Healthy', purchaseCost: 370000 },
    { centerId: kanoCenter.id, supplierId: kanoSuppliers[0]?.id || '', sessionId: session.id, tagNumber: 'COW-KAN-003', status: 'SLAUGHTERED' as CowStatus, estimatedYield: 230, healthStatus: 'Healthy', purchaseCost: 360000 },
  ];

  for (const cow of cowData) {
    if (cow.supplierId) {
      await prisma.cow.create({ data: cow }).catch(() => {});
    }
  }
  console.log('  ✅ 6 sample cows created\n');

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('  🎉 DATABASE SEEDING COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   • ${stateCount} Nigerian states`);
  console.log(`   • ${lgaCount} Local Government Areas`);
  console.log(`   • 3 distribution centers (Abuja, Lagos, Kano)`);
  console.log(`   • 1 active session (Qurbani 2026 / 1448 AH)`);
  console.log(`   • 3 suppliers`);
  console.log(`   • 6 sample cows`);
  console.log(`   • 4 SMS templates`);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  👤 ADMIN LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('🔑 Super Admin:');
  console.log('   Email:    superadmin@deyaanat.org');
  console.log('   Password: Deyaanat@2026');
  console.log('   Access:   Full system access, all centers, all reports');
  console.log('');
  console.log('🔑 Center Admin 1 (Lagos):');
  console.log('   Email:    admin1@deyaanat.org');
  console.log('   Password: Deyaanat@2026');
  console.log('   Access:   Lagos Western Distribution Center only');
  console.log('');
  console.log('🔑 Center Admin 2 (Kano):');
  console.log('   Email:    admin2@deyaanat.org');
  console.log('   Password: Deyaanat@2026');
  console.log('   Access:   Kano Northern Distribution Center only');
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('  🚀 START THE APPLICATION');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('Backend:  cd backend && npm run start:dev');
  console.log('Frontend: cd frontend && npm run dev');
  console.log('Or:      docker compose up -d');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
