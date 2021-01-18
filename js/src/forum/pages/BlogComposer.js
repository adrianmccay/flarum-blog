import Page from "flarum/components/Page";
import Button from "flarum/components/Button";
import Link from "flarum/components/Link";
import BlogAuthor from "../components/BlogItemSidebar/BlogAuthor";
import RenameArticleModal from "../components/Modals/RenameArticleModal";
import TagDiscussionModal from "flarum/tags/components/TagDiscussionModal";
import BlogPostSettingsModal from "../components/Modals/BlogPostSettingsModal";
import Composer from "../components/Composer/Composer";
import LanguageDropdown from "../components/LanguageDropdown/LanguageDropdown";

export default class BlogComposer extends Page {
  oninit(vnode) {
    super.oninit(vnode);

    app.setTitle(app.translator.trans("v17development-flarum-blog.forum.blog"));

    // User cannot write blogs
    if (!app.forum.attribute("canWriteBlogPosts")) {
      m.route.set(app.route("blog"));
      return;
    }

    // Send history push
    app.history.push("blogComposer");

    // Get languages (if enabled)
    this.languages = app.store.all("discussion-languages");

    // Set body class
    this.bodyClass = "BlogItemPage";

    // Article data
    this.articleLanguage = m.route.param("lang")
      ? m.route.param("lang")
      : app.translator.locale;
    this.article = app.store.createRecord("discussions");
    this.blogMeta = null;

    this.tags = [];

    // Pre-select tags
    if (m.route.param().tags) {
      const tagList = Array.isArray(m.route.param().tags)
        ? m.route.param().tags
        : m.route.param().tags.split(",");

      if (m.route.param().tags.length > 0) {
        tagList.forEach((tagId) => {
          const foundTag = app.store.getById("tags", tagId);

          if (foundTag) {
            this.tags.push(foundTag);
          }
        });
      }
    }

    this.isSaving = false;
  }

  openTagsModal(e = null) {
    if (e) {
      e.preventDefault();
    }

    if (this.isSaving) return;

    app.modal.show(TagDiscussionModal, {
      selectedTags: this.tags,
      onsubmit: (tags) => {
        this.tags = tags;
      },
    });
  }

  openNameArticleModal(e = null) {
    if (e) {
      e.preventDefault();
    }

    if (this.isSaving) return;

    app.modal.show(RenameArticleModal, {
      article: this.article,
      onChange: (title) => {
        this.article.pushData({
          attributes: {
            title,
          },
        });
      },
    });
  }

  openBlogSettings(e) {
    e.preventDefault();

    if (this.isSaving) return;

    app.modal.show(BlogPostSettingsModal, {
      meta: this.blogMeta,
      onsubmit: (meta) => (this.blogMeta = meta),
    });
  }

  view() {
    const blogImage =
      this.blogMeta && this.blogMeta.featuredImage()
        ? `url(${this.blogMeta.featuredImage()})`
        : null;

    return (
      <div className={"FlarumBlogItem"}>
        <div className={"container"}>
          <div className={"FlarumBlog-ToolButtons"}>
            <Link
              href={app.route("blog")}
              className={"Button"}
              loading={this.isSaving}
              icon={"fas fa-angle-left"}
            >
              <i class="icon fas fa-angle-left Button-icon"></i>
              <span class="Button-label">
                {app.translator.trans(
                  "v17development-flarum-blog.forum.return_to_overview"
                )}
              </span>
            </Link>
          </div>
          <div className={"FlarumBlog-Article"}>
            <div className={"FlarumBlog-Article-Container"}>
              <div className={"FlarumBlog-Article-Content"}>
                <div
                  className={`FlarumBlog-Article-Image FlarumBlog-default-image`}
                  style={{
                    backgroundImage: blogImage,
                    cursor: "pointer",
                  }}
                  onclick={(e) => this.openBlogSettings(e)}
                />

                <div className={"FlarumBlog-Article-Content-Edit-Button"}>
                  <div
                    className={
                      this.languages.length === 0
                        ? "FlarumBlog-Article-Content-Edit-Dropdown"
                        : "FlarumBlog-Article-Content-EditButtons"
                    }
                  >
                    {this.languages !== null && this.languages.length >= 1 && (
                      <LanguageDropdown
                        selected={this.articleLanguage}
                        onclick={(language) =>
                          (this.articleLanguage = language)
                        }
                      />
                    )}

                    <Button
                      className={"Button"}
                      onclick={(e) => this.openBlogSettings(e)}
                      icon={"fas fa-pencil-alt"}
                      loading={this.isSaving}
                    >
                      Update blog settings
                    </Button>
                  </div>
                </div>

                {/* Article Categories */}
                <div className={"FlarumBlog-Article-Categories"}>
                  {this.tags.map((tag) => (
                    <a href={"#"} onclick={(e) => this.openTagsModal(e)}>
                      {tag.name()}
                    </a>
                  ))}

                  <a href={"#"} onclick={(e) => this.openTagsModal(e)}>
                    {this.tags.length === 0
                      ? app.translator.trans(
                          "v17development-flarum-blog.forum.composer.select_category"
                        )
                      : app.translator.trans(
                          "v17development-flarum-blog.forum.composer.edit_categories"
                        )}{" "}
                    <i className={"fas fa-edit"} />
                  </a>
                </div>

                <div className={"FlarumBlog-Article-Post"}>
                  {/* Article name */}
                  <h3
                    onclick={() => this.openNameArticleModal()}
                    style={{ cursor: "pointer" }}
                  >
                    {this.article &&
                    this.article.title() &&
                    this.article.title() !== ""
                      ? this.article.title()
                      : app.translator.trans(
                          "v17development-flarum-blog.forum.composer.no_title"
                        )}

                    <a href={"#"} onclick={(e) => e.preventDefault()}>
                      <i className={"fas fa-edit"} />
                    </a>
                  </h3>

                  <div className="Post-body">
                    <Composer
                      composer={app.composer}
                      originalContent={""}
                      submitLabel={app.translator.trans(
                        "v17development-flarum-blog.forum.composer.post_article"
                      )}
                      placeholder={app.translator.trans(
                        "v17development-flarum-blog.forum.composer.enter_message_here"
                      )}
                      onsubmit={() => this.create()}
                      disabled={this.isSaving}
                    />
                  </div>
                </div>
              </div>

              <div className={"FlarumBlog-Article-Comments"}>
                <h4>
                  {app.translator.trans(
                    "v17development-flarum-blog.forum.comment_section.comments"
                  )}{" "}
                  (0)
                </h4>
                {/* Locked */}

                <div className={"Post-body"}>
                  <blockquote class="uncited">
                    <div>
                      <span
                        className={"fas fa-ban"}
                        style={{ marginRight: "5px" }}
                      />{" "}
                      {app.translator.trans(
                        "v17development-flarum-blog.forum.composer.comment_section"
                      )}
                    </div>
                  </blockquote>
                </div>
              </div>
            </div>
            <div className={"FlarumBlog-Article-Sidebar"}>
              <BlogAuthor user={app.session.user} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  create() {
    const blogTags = app.forum.attribute("blogTags") || [];

    // Force tags
    if (this.tags.length === 0) {
      this.openTagsModal();
      return;
    }

    // Force title
    if (!this.article.title() || this.article.title() === "") {
      this.openNameArticleModal();
      return;
    }

    // Find knowledge base tags
    const findblogTags = this.tags.filter((tag) => {
      return blogTags.indexOf(tag.id()) >= 0;
    });

    // No knowledge base tags selected
    if (findblogTags.length === 0) {
      alert(
        app.translator.trans(
          "v17development-flarum-blog.forum.composer.no_blog_tags_selected"
        )
      );
      return;
    }

    if (
      (this.blogMeta === null ||
        !this.blogMeta.featuredImage() ||
        !this.blogMeta.summary()) &&
      !confirm(
        app.translator.trans(
          "v17development-flarum-blog.forum.composer.post_without_blog_info"
        )
      )
    ) {
      return;
    }

    let relationships = {
      tags: this.tags,
    };

    // Add languages if possible
    if (this.languages.length > 0) {
      relationships.language = app.store.getBy(
        "discussion-languages",
        "code",
        this.articleLanguage
      );
    }

    const data = {
      title: this.article.title(),
      content: app.composer.fields.content(),
      relationships,
      blogMeta:
        this.blogMeta !== null
          ? {
              featuredImage: this.blogMeta.featuredImage(),
              summary: this.blogMeta.summary(),
              isSized: this.blogMeta.isSized(),
            }
          : null,
    };

    this.isSaving = true;

    this.article
      .save(data)
      .then((article) => {
        setTimeout(() => {
          // Redirect to the article
          m.route.set(app.route("blogArticle", { id: `${article.slug()}` }));
        }, 500);
      })
      .catch(() => {
        this.isSaving = false;
        m.redraw();
      });
  }
}
