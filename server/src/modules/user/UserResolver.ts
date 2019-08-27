import {
  Arg,
  Resolver,
  Query,
  Authorized,
  Mutation,
  Ctx,
  ID,
  InputType,
  FieldResolver as GQLFieldResolver,
  Field as GQLField, Root,
} from 'type-graphql'
import { Context } from '../common/context'
import { UserService } from './UserService'
import { User, Profile } from './UserEntity'
import './enums'
import { accountsPassword } from './accounts'
import { Role } from './enums'
import { Double } from 'bson';

@InputType()
class ProfileInput implements Partial<Profile> {
  @GQLField(type => String)
  firstName: string

  @GQLField(type => String)
  lastName: string

  @GQLField(type => String)
  profilePicture: string
}

@InputType()
class CreateUserInput implements Partial<User> {
  @GQLField(type => String)
  email: string

  @GQLField(type => String)
  password: string

  @GQLField(type => ProfileInput)
  profile: ProfileInput

  @GQLField(type => Boolean)
  isCompany: boolean

  @GQLField(type => Number)
  cachesFound: number
}

@InputType()
export class PropertyInput {
  @GQLField(type => String)
  address: string

  @GQLField(type => String)
  placeId: string

  @GQLField(type => Number)
  rentAmount: number
}

@Resolver(User)
export default class UserResolver {
  private readonly service: UserService

  constructor() {
    this.service = new UserService()
  }

  @Query(returns => User)
  @Authorized()
  async me(@Ctx() ctx: Context) {
    if (ctx.userId) {
      return await this.service.findOneById(ctx.userId)
    }
  }

  @Query(returns => [User])
  async users() {
    return await this.service.find();
  }

  // this overrides accounts js `createUser` function
  @Mutation(returns => ID)
  async createUser(@Arg('user', returns => CreateUserInput) user: CreateUserInput) {
    const createdUserId = await accountsPassword.createUser({
      ...user,
      roles: [Role.User],
    })

    return createdUserId
  }

  @Mutation(returns => User)
  async setNewProfileData(
    @Arg("user") user: string, 
    @Arg("firstName") firstName: string, 
    @Arg("lastName") lastName: string, 
    @Arg("profilePic") profilePic: string) 
    {
    return await this.service.setNewProfileData(user, firstName, lastName, profilePic);
  }

  @Mutation(returns => User)
  async addCacheFound(
    @Arg("user") user: string, 
    @Arg("caches") caches: number) 
    {
    return await this.service.addCacheFound(user, caches);
  }

  @GQLFieldResolver(returns => String)
    async firstName(@Root() user: User) {
    console.log('user: ', user);
      return user.profile.firstName
    }

  @GQLFieldResolver(returns => String)
  async lastName(@Root() user: User) {
    return user.profile.lastName
  }

  @GQLFieldResolver(returns => String)
  async profilePicture(@Root() user: User) {
    return user.profile.profilePicture
  }
  
  @GQLFieldResolver(returns => Boolean)
  async isCompany(@Root() user: User) {
    return user.isCompany
  }

  @GQLFieldResolver(returns => Number)
  async cachesFound(@Root() user: User) {
    return user.cachesFound;
  }
}
