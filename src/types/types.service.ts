import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CredentialType } from './credential-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from 'src/organizations/organization.entity';
import { JolocomCredentialType } from 'src/connectors/jolocom/jolocom-credential-type.entity';
import { IdaCredentialType } from 'src/connectors/ida/ida-credential-type.entity';
import { IndySchema } from 'src/connectors/indy/indy-schema.entity';

interface CreateData {
  organizationId: number | string;
  jolocomCredentialTypeId?: number | string;
  idaCredentialTypeId?: number | string;
  indySchemaId?: number | string;
  irmaType: string;
  type: string;
}

@Injectable()
export class TypesService {
  constructor(
    @InjectRepository(CredentialType)
    private readonly typesRespository: Repository<CredentialType>,
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
    @InjectRepository(JolocomCredentialType)
    private readonly jolocomTypeRepository: Repository<JolocomCredentialType>,
    @InjectRepository(IdaCredentialType)
    private readonly idaTypeRepository: Repository<IdaCredentialType>,
    @InjectRepository(IndySchema)
    private readonly indySchemasRepository: Repository<IndySchema>,
  ) {}

  async findAll() {
    return this.typesRespository.find({
      relations: ['organization', 'jolocomType'],
      // relations: ['organization', 'jolocomType', 'idaType'],
    });
  }

  async create({
    organizationId,
    jolocomCredentialTypeId,
    idaCredentialTypeId,
    indySchemaId,
    irmaType,
    type,
  }: CreateData) {
    const organization = await this.organizationsRepository.findOneOrFail(
      organizationId,
    );
    const jolocomCredentialType = jolocomCredentialTypeId
      ? await this.jolocomTypeRepository.findOneOrFail(jolocomCredentialTypeId)
      : null;
    const idaCredentialType = idaCredentialTypeId
      ? await this.idaTypeRepository.findOneOrFail(idaCredentialTypeId)
      : null;
    const indySchema = indySchemaId
      ? await this.indySchemasRepository.findOneOrFail(indySchemaId)
      : null;

    const credentialType = new CredentialType();

    credentialType.type = type;
    credentialType.irmaType = irmaType;
    credentialType.organization = organization;
    credentialType.jolocomType = jolocomCredentialType;
    credentialType.idaType = idaCredentialType;
    credentialType.indySchema = indySchema;

    return this.typesRespository.save(credentialType);
  }
}
