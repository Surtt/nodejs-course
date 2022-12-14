import dedent from "dedent-js";
import { PrismaClient } from '@prisma/client';
import {MyContext} from "../types";

const prisma = new PrismaClient();

export const getCategory = async (ctx: MyContext) => {
    const city = ctx.session.cityProp;
    const user = await prisma.user.findUnique({ where: { userId: ctx.session.userProp}});
    const categories = user?.categories;
    if ("callback_query" in ctx.update) {
        const category = ctx.update.callback_query.data as string;
        const getCategories = () => {
            if (!categories?.includes(category)) {
                return categories?.concat(category)
            } else {
                return;
            }
        }
        await prisma.user.update({ where: { userId: ctx.session.userProp}, data: { categories: getCategories()}});
        const actions = await prisma.action.findMany({ where: { category, city }});
        return !actions.length  ? ctx.reply(`Акций в категории "${category}" в вашем городе не найдено`) : actions.map((action) => {
            ctx.replyWithHTML(
                dedent`
              <b>📚 Название:</b> ${action.title}
              
              <b>💬 Описание:</b> ${action.text}
              
              <b>🏢 Город:</b> ${action.city}
              
              <b>🏁 Дата начала акции:</b> ${action.startDay.toLocaleDateString('ru-RU')}
              
              <b>🏁 Дата окончания акции:</b> ${action.endDay.toLocaleDateString('ru-RU')}
              
              <b>🏷 Теги:</b> ${action.tags.map((t) => `#${t}`).join(' ')}
              `);
        });
    }
}
