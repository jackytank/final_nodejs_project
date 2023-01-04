import { CustomApiResult } from './../../../customTypings/express/index';
import { Request, Response } from 'express';
import dayjs from 'dayjs';
import _ from 'lodash';
import { UserService } from '../../../services/user.services';
import { User } from '../../../entities/user.entity';
import { CustomEntityApiResult } from '../../../customTypings/express';
import { POS_NAME } from '../../../constants';
import { AppDataSource } from '../../../DataSource';
import process from 'process';

class AdminUserController {
    private userRepo = AppDataSource.getRepository(User);
    private userService = new UserService();

    constructor() {
        this.addPage = this.addPage.bind(this);
        this.contactPage = this.contactPage.bind(this);
        this.createNewUser = this.createNewUser.bind(this);
        this.editPage = this.editPage.bind(this);
        this.update = this.update.bind(this);
        this.listPage = this.listPage.bind(this);
    }
    // GET
    async addPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        const dataBack = req.flash('dataBack')[0];
        res.render('admin/users/add', {
            activeTab: 'addUserTab',
            dataBack: dataBack ?? {},
            message: flashMessage
        });
    }
    // GET
    async contactPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        const dataBack = req.flash('dataBack')[0];
        res.render('admin/contact/index', {
            activeTab: 'contactTab',
            dataBack: dataBack ?? {},
            message: flashMessage
        });
    }
    // POST
    async createNewUser(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        // get body 
        const { name, username, password, email, role } = req.body;
        const user: User = Object.assign(new User(), {
            name, username, password, email, role
        });
        try {
            const result: CustomEntityApiResult<User> = await this.userService.insertData(user, null, queryRunner, { wantValidate: true, isPasswordHash: true });
            if (result.status === 400 || result.status === 500) {
                await queryRunner.rollbackTransaction();
                req.flash('message', result.message ?? 'Error when create user!');
                req.flash('dataBack', req.body);
                return res.redirect('/admin/users/addPage');
            }
            await queryRunner.commitTransaction();
            req.flash('message', result.message ?? 'New user created!!');
            return res.redirect('/admin/users/list');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            req.flash('message', error.message ?? 'Error when create user!');
            req.flash('dataBack', req.body);
            return res.redirect('/admin/users/addPage');
        } finally {
            await queryRunner.release();
        }
    }
    // GET
    async editPage(req: Request, res: Response) {
        const { id } = req.params;
        const result: CustomEntityApiResult<User> = await this.userService.getOneData(parseInt(id));
        if (result.status === 200) {
            const flashMessage = req.flash('message')[0];
            res.render('admin/users/edit', {
                activeTab: 'listUserTab',
                dataBack: {},
                message: flashMessage,
                user: result.data
            });
        } else {
            req.flash("message", `Can't find user with id: ${id}`);
            res.redirect('/admin/users/list');
        }
    }
    // POST
    async update(req: Request, res: Response) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const { id, name, username, email, role } = req.body;
        const user: User = Object.assign(new User(), { id, name, username, email, role });
        // if role from req is not user, check if user is admin or manager if neither throw 403
        if (role !== POS_NAME.GE_DI + '') {
            if (req.session.user?.position_id !== POS_NAME.GR_LE && req.session.user?.position_id !== POS_NAME.LE) {
                req.flash('message', 'You are not authorized to do this action!');
                return res.redirect(req.originalUrl ?? `/admin/users/edit/${id.trim()}`);
            }
        }
        try {
            const result: CustomEntityApiResult<User> = await this.userService.updateData(user, null, queryRunner, { wantValidate: true });
            if (result.status === 404) {
                req.flash('message', result.message ?? `Can't find user!`);
                res.redirect('/admin/users/list');
            }
            await queryRunner.commitTransaction();
            req.flash('message', result.message ?? 'Update successfully!');
            res.redirect('/admin/users/list');
        } catch (error) {
            await queryRunner.rollbackTransaction();
            req.flash('message', error.message ?? 'Can not update user!');
            res.redirect(req.originalUrl ?? `/admin/users/edit/${id.trim()}`);
        } finally {
            await queryRunner.release();
        }
    }
    // GET
    async listPage(req: Request, res: Response) {
        const flashMessage = req.flash('message')[0];
        res.render('admin/users/list', {
            activeTab: 'listUserTab',
            queryBack: {},
            dayjs: dayjs,
            message: flashMessage,
        });
    }
}

export default new AdminUserController();
